import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  FormControl,
  FormLabel,
  Grid,
} from '@mui/material';
import { Lead } from '../../pages/LeadsPage'; // Assuming Lead interface is exported

interface DuplicateLeadResolutionModalProps {
  open: boolean;
  onClose: () => void;
  duplicateGroups: Lead[][];
  onMerge: (mainLeadId: string, leadsToMergeIds: string[], fieldsToMerge: string[]) => void;
}

const DuplicateLeadResolutionModal: React.FC<DuplicateLeadResolutionModalProps> = ({
  open,
  onClose,
  duplicateGroups,
  onMerge,
}) => {
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [mainLeadId, setMainLeadId] = useState<string | null>(null);
  const [fieldsToMerge, setFieldsToMerge] = useState<string[]>([]);

  const currentGroup = duplicateGroups[selectedGroupIndex];

  // Reset state when modal opens for a new group
  React.useEffect(() => {
    if (open && currentGroup && currentGroup.length > 0) {
      setMainLeadId(currentGroup[0].id); // Default to first lead as main
      setFieldsToMerge([]); // Clear fields on new group
    }
  }, [open, currentGroup, selectedGroupIndex]);

  if (!open || !currentGroup) {
    return null;
  }

  const handleMainLeadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMainLeadId(event.target.value);
  };

  const handleFieldToMergeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setFieldsToMerge((prev) =>
      checked ? [...prev, value] : prev.filter((field) => field !== value)
    );
  };

  const handleMerge = () => {
    if (!mainLeadId) {
      alert('Por favor, selecione um Lead Principal.');
      return;
    }

    const leadsToMergeIds = currentGroup
      .filter((lead) => lead.id !== mainLeadId)
      .map((lead) => lead.id);

    onMerge(mainLeadId, leadsToMergeIds, fieldsToMerge);
    // Move to next group or close modal
    if (selectedGroupIndex < duplicateGroups.length - 1) {
      setSelectedGroupIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const commonFields = Object.keys(currentGroup[0] || {}).filter(
    (key) => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt'
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Resolver Leads Duplicados ({selectedGroupIndex + 1}/{duplicateGroups.length})</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          Por favor, selecione o lead principal para este grupo e quais campos deseja mesclar.
        </Typography>

        <Box mt={3}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Lead Principal</FormLabel>
            <RadioGroup value={mainLeadId} onChange={handleMainLeadChange}>
              <Grid container spacing={2}>
                {currentGroup.map((lead) => (
                  <Grid item xs={12} sm={6} key={lead.id}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        bgcolor: mainLeadId === lead.id ? 'primary.light' : 'background.paper',
                        border: mainLeadId === lead.id ? '1px solid primary.main' : '1px solid divider',
                      }}
                    >
                      <FormControlLabel
                        value={lead.id}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="subtitle2">{lead.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{lead.email}</Typography>
                            <Typography variant="caption" color="text.secondary">{lead.source} - Score: {lead.score}</Typography>
                          </Box>
                        }
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </RadioGroup>
          </FormControl>
        </Box>

        <Box mt={4}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Campos a Mesclar dos Outros Leads</FormLabel>
            <FormGroup row>
              {commonFields.map((field) => (
                <FormControlLabel
                  key={field}
                  control={
                    <Checkbox
                      checked={fieldsToMerge.includes(field)}
                      onChange={handleFieldToMergeChange}
                      value={field}
                    />
                  }
                  label={field}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleMerge} variant="contained" color="primary">
          Mesclar e Próximo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DuplicateLeadResolutionModal;
