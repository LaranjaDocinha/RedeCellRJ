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
  Skeleton,
  Tooltip
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
import { AnimatePresence, motion } from 'framer-motion'; // Corrected import
type IconMapType = Record<string, React.ElementType>;

const iconMap: IconMapType = {
  Settings: SettingsIcon,
  Palette: PaletteIcon,
  Lock: LockIcon,
  UserCircle: PersonIcon,
  Bell: NotificationsIcon,
  Box: Inventory2Outlined,
};

const SettingsPage: React.FC = () => {
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
  const { addToast } = useNotification();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (token) {
      fetchSettings(token);
    }
  }, [token, fetchSettings]);

  const changedSettings = getChangedSettings();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (changedSettings.length > 0) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [changedSettings.length]);

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
        if (getChangedSettings().length > 0) {
            addToast('Settings saved successfully!', 'success');
        } else {
            addToast('No changes to save.', 'info');
        }
    } else {
        addToast('Failed to save settings.', 'error');
    }
  };

  const handleCancel = () => {
    resetAll();
    addToast('Changes cancelled.', 'info');
  };

  const handleResetCategory = (categoryKey: string) => {
    resetCategory(categoryKey);
    addToast(`Settings in category restored.`, 'info');
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

  useEffect(() => {
    if (activeTab >= categoryKeys.length) {
      setActiveTab(0);
    }
  }, [categoryKeys, activeTab]);

  if (loading) {
    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom><Skeleton width="200px" /></Typography>
            <Box mb={3}><Skeleton variant="rectangular" height={56} /></Box>
            <Grid container spacing={4}>
                <Grid xs={12} md={3}><Skeleton variant="rectangular" height={48 * 5} /></Grid>
                <Grid xs={12} md={9}><Skeleton variant="rectangular" height={400} /></Grid>
            </Grid>
        </Box>
    );
  }

  if (!filteredSettings) {
    return <Typography sx={{ textAlign: 'center', p: 4 }}>Could not load settings.</Typography>;
  }

  const renderTabs = () => {
    if (isMobile) {
      return (
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select value={activeTab} label="Category" onChange={(e) => handleTabChange(e, e.target.value as number)}>
            {categoryKeys.map((key, index) => (
              <MenuItem key={key} value={index}>{filteredSettings[key].title}</MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    return (
      <Tabs orientation="vertical" variant="scrollable" value={activeTab} onChange={handleTabChange} sx={{ borderRight: 1, borderColor: 'divider' }}>
        {categoryKeys.map((key) => {
          const category = filteredSettings?.[key];
          if (!category) return null; // Ensure category exists
          const Icon = iconMap[category.icon] || SettingsIcon;
          return <Tab key={key} icon={<Icon />} iconPosition="start" label={category.title || 'Untitled Category'} />; // Add fallback for title
        })}
      </Tabs>
    );
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Configurações</Typography>
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Pesquisar configurações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
      </Box>

      <Grid container spacing={4}>
        <Grid xs={12} md={3}>{renderTabs()}</Grid>
        <Grid xs={12} md={9}>
          <AnimatePresence mode="wait">
            {activeCategory ? (
              <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                <Card elevation={2}>
                  <CardHeader title={activeCategory.title} />
                  <Divider />
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {activeCategory.settings.length > 0 ? (
                        activeCategory.settings.map((setting) => {
                            const initialValue = initialSettings?.[activeCategoryKey]?.settings.find(s => s.key === setting.key)?.value ?? '';
                            return (
                                <SettingControl
                                    key={setting.key}
                                    setting={setting}
                                    initialValue={initialValue}
                                    onChange={updateSettingValue}
                                    onReset={resetSetting}
                                />
                            )
                        })
                    ) : (
                        <Typography>Nenhuma configuração encontrada.</Typography>
                    )}
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2, gap: 1 }}>
                    <Button variant="text" onClick={() => handleResetCategory(activeCategoryKey)} disabled={saving || getCategoryChanges(activeCategoryKey).length === 0}>
                        Resetar Categoria
                    </Button>
                    <Box sx={{flexGrow: 1}} />

                    <Button variant="outlined" onClick={handleCancel} disabled={saving || changedSettings.length === 0}>Cancelar</Button>
                    <Button variant="contained" color="primary" onClick={handleSave} disabled={saving || changedSettings.length === 0} sx={{ width: 150 }}>
                        <AnimatePresence mode='wait'>
                            {saving ? (
                                <motion.div key="saving" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}><CircularProgress size={24} sx={{ color: 'white' }} /></motion.div>
                            ) : showSuccess ? (
                                <motion.div key="success" initial={{opacity: 0, scale: 0.5}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.5}}><CheckIcon /></motion.div>
                            ) : (
                                <motion.div key="save" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>Salvar</motion.div>
                            )}
                        </AnimatePresence>
                    </Button>
                  </CardActions>
                </Card>
              </motion.div>
            ) : (
                <Typography>Nenhum resultado para "{searchTerm}"</Typography>
            )}
          </AnimatePresence>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;