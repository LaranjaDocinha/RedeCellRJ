
import React from 'react';
import {
  TextField,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Box,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import { ColorPicker } from './ColorPicker';
import { AvatarUpload } from './AvatarUpload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { motion } from 'framer-motion';

interface SettingOption {
  value: string;
  label: string;
}

export interface StructuredSetting {
  key: string;
  value: string;
  type: 'text' | 'select' | 'boolean' | 'color' | 'password' | 'avatar';
  label: string;
  description: string;
  options?: SettingOption[];
}

interface SettingControlProps {
  setting: StructuredSetting;
  initialValue: string;
  onChange: (key: string, value: string | boolean) => void;
  onReset: (key: string) => void;
}

export const SettingControl: React.FC<SettingControlProps> = ({ setting, initialValue, onChange, onReset }) => {
  const isChanged = setting.value !== initialValue;

  const renderControl = () => {
    switch (setting.type) {
      case 'boolean':
        return <Switch checked={setting.value === 'true'} onChange={(e) => onChange(setting.key, e.target.checked)} name={setting.key} />;
      case 'select':
        return (
          <FormControl fullWidth variant="outlined" size="small" sx={{width: 220}}>
            <InputLabel>{setting.label}</InputLabel>
            <Select value={setting.value} label={setting.label} onChange={(e) => onChange(setting.key, e.target.value)}>
              {setting.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'color':
        return <ColorPicker value={setting.value} onChange={(color) => onChange(setting.key, color)} />;
      case 'password':
        return <TextField type="password" name={setting.key} label={setting.label} value={setting.value} onChange={(e) => onChange(setting.key, e.target.value)} fullWidth autoComplete="new-password" variant="outlined" size="small" sx={{width: 220}}/>;
      case 'avatar':
        return <AvatarUpload value={setting.value} onChange={(base64) => onChange(setting.key, base64)} />;
      case 'text':
      default:
        return <TextField type="text" name={setting.key} label={setting.label} value={setting.value} onChange={(e) => onChange(setting.key, e.target.value)} fullWidth variant="outlined" size="small" sx={{width: 220}}/>;
    }
  };

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
      <Box flexGrow={1} pr={2}>
        <Typography variant="subtitle1">{setting.label}</Typography>
        <FormHelperText>{setting.description}</FormHelperText>
      </Box>
      <Box display="flex" alignItems="center" gap={1} flexShrink={0} ml={2}>
        {isChanged && setting.type !== 'avatar' && (
            <motion.div initial={{scale: 0, opacity: 0}} animate={{scale: 1, opacity: 1}} transition={{duration: 0.2}}>
                <Tooltip title="Resetar para o padrão">
                    <IconButton onClick={() => onReset(setting.key)} size="small">
                        <RestartAltIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </motion.div>
        )}
        {renderControl()}
      </Box>
    </Box>
  );
};
