
import React, { useState, useRef } from 'react';
import { Avatar, Badge, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { motion } from 'framer-motion';

interface AvatarUploadProps {
  value: string; // Base64 string or URL
  onChange: (base64: string) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ value, onChange }) => {
  const [preview, setPreview] = useState<string | null>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/gif"
            style={{ display: 'none' }}
        />
        <Tooltip title="Change Avatar">
            <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                    <IconButton 
                        onClick={handleEditClick} 
                        size="small"
                        sx={{ 
                            background: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            '&:hover': { background: 'rgba(0,0,0,0.7)' }
                        }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                }
            >
                <Avatar src={preview || undefined} sx={{ width: 80, height: 80 }} />
            </Badge>
        </Tooltip>
    </Box>
  );
};
