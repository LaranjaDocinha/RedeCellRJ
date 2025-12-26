import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Typography,
  Button,
  Divider,
  CardActions,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PaletteIcon from '@mui/icons-material/Palette';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { SettingControl } from '../components/settings/SettingControl';
import { useSettingsStore, AllSettingsStructured } from '../store/settingsStore';
import { AnimatePresence, motion } from 'framer-motion';

type IconMapType = Record<string, React.ElementType>;

const iconMap: IconMapType = {
  Settings: SettingsIcon,
  Palette: PaletteIcon,
  Lock: LockIcon,
  UserCircle: PersonIcon,
  Bell: NotificationsIcon,
  Box: Inventory2Outlined,
};

const GeneralSettings: React.FC = () => {
  const {
    settings,
    initialSettings,
    loading,
    saving,
    showSuccess,
    fetchSettings,
    updateSettingValue,
    resetSetting,
    resetCategory,
    resetAll,
    saveSettings,
    getChangedSettings,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useAuth();
  const { showNotification } = useNotification();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (token) {
      fetchSettings(token);
    }
  }, [token, fetchSettings]);

  const changedSettings = getChangedSettings();

  const filteredSettings = useMemo(() => {
    if (!settings) return null;
    if (!searchTerm) return settings;
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered: AllSettingsStructured = {};
    for (const categoryKey in settings) {
      const category = settings[categoryKey];
      const matchingSettings = category.settings.filter(
        (s) =>
          s.label.toLowerCase().includes(lowercasedFilter) ||
          s.description.toLowerCase().includes(lowercasedFilter)
      );
      if (matchingSettings.length > 0 || category.title.toLowerCase().includes(lowercasedFilter)) {
        filtered[categoryKey] = { ...category, settings: matchingSettings.length > 0 ? matchingSettings : category.settings };
      }
    }
    return filtered;
  }, [settings, searchTerm]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSave = async () => {
    if (!token) return;
    const success = await saveSettings(token);
    if (success) {
        showNotification('Configurações salvas com sucesso!', 'success');
    } else {
        showNotification('Erro ao salvar configurações.', 'error');
    }
  };

  const handleCancel = () => {
    resetAll();
    showNotification('Alterações descartadas.', 'info');
  };

  const handleResetCategory = (categoryKey: string) => {
    resetCategory(categoryKey);
    showNotification(`Categoria restaurada.`, 'info');
  }

  const categoryKeys = useMemo(() => (filteredSettings ? Object.keys(filteredSettings) : []), [filteredSettings]);
  const activeCategoryKey = categoryKeys[activeTab];
  const activeCategory = filteredSettings ? filteredSettings[activeCategoryKey] : null;

  const getCategoryChanges = useCallback((categoryKey: string) => {
      if (!settings || !initialSettings) return [];
      const category = settings[categoryKey];
      const initialCategory = initialSettings[categoryKey];
      if (!category || !initialCategory) return [];
      return category.settings.filter(setting => {
          const initial = initialCategory.settings.find(s => s.key === setting.key);
          return initial && initial.value !== setting.value;
      });
  }, [settings, initialSettings]);

  if (loading) return <Box p={3}><Skeleton variant="rectangular" height={400} /></Box>;

  return (
    <Box>
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Pesquisar nestas configurações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 3 }}>
            {isMobile ? (
                <FormControl fullWidth>
                    <Select value={activeTab} onChange={(e) => setActiveTab(e.target.value as number)}>
                        {categoryKeys.map((key, index) => <MenuItem key={key} value={index}>{filteredSettings![key].title}</MenuItem>)}
                    </Select>
                </FormControl>
            ) : (
                <Tabs orientation="vertical" variant="scrollable" value={activeTab} onChange={handleTabChange} sx={{ borderRight: 1, borderColor: 'divider' }}>
                    {categoryKeys.map((key) => {
                        const category = filteredSettings?.[key];
                        const Icon = iconMap[category?.icon || 'Settings'] || SettingsIcon;
                        return <Tab key={key} icon={<Icon />} iconPosition="start" label={category?.title} />;
                    })}
                </Tabs>
            )}
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <AnimatePresence mode="wait">
            {activeCategory ? (
              <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card elevation={2}>
                  <CardHeader title={activeCategory.title} />
                  <Divider />
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {activeCategory.settings.map((setting) => (
                        <SettingControl
                            key={setting.key}
                            setting={setting}
                            initialValue={initialSettings?.[activeCategoryKey]?.settings.find(s => s.key === setting.key)?.value ?? ''}
                            onChange={updateSettingValue}
                            onReset={resetSetting}
                        />
                    ))}
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2, gap: 1 }}>
                    <Button variant="text" onClick={() => handleResetCategory(activeCategoryKey)} disabled={saving || getCategoryChanges(activeCategoryKey).length === 0}>
                        Resetar Categoria
                    </Button>
                    <Button variant="outlined" onClick={handleCancel} disabled={saving || changedSettings.length === 0}>Cancelar</Button>
                    <Button variant="contained" color="primary" onClick={handleSave} disabled={saving || changedSettings.length === 0} sx={{ width: 150 }}>
                        {saving ? <CircularProgress size={24} color="inherit" /> : showSuccess ? <CheckIcon /> : 'Salvar'}
                    </Button>
                  </CardActions>
                </Card>
              </motion.div>
            ) : <Typography>Nenhum resultado.</Typography>}
          </AnimatePresence>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeneralSettings;
