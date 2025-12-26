import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress, 
  Stepper, 
  Step, 
  StepLabel,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  FormControlLabel,
  RadioGroup,
  Radio,
  Divider,
  Container,
  useTheme,
  Avatar,
  Stack,
  IconButton
} from '@mui/material';
import { 
  Smartphone as PhoneIcon, 
  CheckCircle as CheckIcon, 
  ArrowForward as ArrowIcon,
  RestartAlt as ResetIcon,
  Calculate as CalcIcon,
  HelpOutline as HelpIcon,
  Verified as VerifiedIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useAuth } from '../contexts/AuthContext';
import moment, { Moment } from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

const devices = [
  { id: 1, name: 'iPhone 15 Pro', image: 'https://placehold.co/200x300?text=iPhone+15+Pro' },
  { id: 2, name: 'iPhone 14 Pro', image: 'https://placehold.co/200x300?text=iPhone+14+Pro' },
  { id: 3, name: 'iPhone 13', image: 'https://placehold.co/200x300?text=iPhone+13' },
  { id: 4, name: 'Samsung S23 Ultra', image: 'https://placehold.co/200x300?text=S23+Ultra' },
];

const steps = ['Modelo', 'Estado Visual', 'Funcionamento', 'Avaliação'];

const BuybackProgramPage: React.FC = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [condition, setCondition] = useState('excelente');
  const [functionalStatus, setFunctionalStatus] = useState('full');
  const [buybackValue, setBuybackValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();

  const handleNext = () => {
    if (activeStep === 2) {
      calculateValue();
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const calculateValue = () => {
    setLoading(true);
    // Simulated logic: Start at 4000, subtract based on model, condition and functional
    setTimeout(() => {
      let base = 4000 - (selectedDevice?.id * 500);
      if (condition === 'bom') base *= 0.8;
      if (condition === 'ruim') base *= 0.5;
      if (functionalStatus === 'partial') base *= 0.7;
      setBuybackValue(base);
      setLoading(false);
    }, 1500);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            {devices.map((device) => (
              <Grid item xs={12} sm={6} md={3} key={device.id}>
                <Card 
                  sx={{ 
                    borderRadius: '20px', 
                    border: selectedDevice?.id === device.id ? '2px solid' : '1px solid',
                    borderColor: selectedDevice?.id === device.id ? 'primary.main' : 'divider',
                    bgcolor: selectedDevice?.id === device.id ? 'action.hover' : 'background.paper',
                    transition: 'all 0.2s'
                  }}
                >
                  <CardActionArea onClick={() => setSelectedDevice(device)} sx={{ p: 1 }}>
                    <CardMedia component="img" height="200" image={device.image} sx={{ borderRadius: '12px', objectFit: 'contain' }} />
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={800}>{device.name}</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={3}>
               <Paper variant="outlined" sx={{ height: '100%', borderRadius: '20px', borderStyle: 'dashed', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3, cursor: 'pointer' }}>
                  <AddIcon color="action" />
                  <Typography variant="body2" color="text.secondary">Outro Modelo</Typography>
               </Paper>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" fontWeight={800} gutterBottom textAlign="center">Como está o estado visual do aparelho?</Typography>
            <RadioGroup value={condition} onChange={(e) => setCondition(e.target.value)}>
              {[
                { val: 'excelente', label: 'Excelente', desc: 'Sem riscos ou marcas de uso. Parece novo.' },
                { val: 'bom', label: 'Bom', desc: 'Riscos leves quase imperceptíveis na tela ou carcaça.' },
                { val: 'ruim', label: 'Avariado', desc: 'Trincas, amassados ou riscos profundos.' },
              ].map((item) => (
                <Paper key={item.val} sx={{ p: 2, mb: 2, borderRadius: '16px', border: '1px solid', borderColor: condition === item.val ? 'primary.main' : 'divider' }}>
                  <FormControlLabel 
                    value={item.val} 
                    control={<Radio />} 
                    label={<Box sx={{ ml: 1 }}><Typography fontWeight={700}>{item.label}</Typography><Typography variant="caption" color="text.secondary">{item.desc}</Typography></Box>} 
                    sx={{ width: '100%', m: 0 }}
                  />
                </Paper>
              ))}
            </RadioGroup>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" fontWeight={800} gutterBottom textAlign="center">Tudo funciona perfeitamente?</Typography>
            <RadioGroup value={functionalStatus} onChange={(e) => setFunctionalStatus(e.target.value)}>
              {[
                { val: 'full', label: 'Totalmente Funcional', desc: 'FaceID, Câmeras, Botões e WiFi funcionam 100%.' },
                { val: 'partial', label: 'Problemas Leves', desc: 'Botões duros, bateria com saúde baixa ou falhas WiFi.' },
                { val: 'broken', label: 'Não Liga / Tela Queimada', desc: 'Aparelho não inicia ou possui manchas na tela.' },
              ].map((item) => (
                <Paper key={item.val} sx={{ p: 2, mb: 2, borderRadius: '16px', border: '1px solid', borderColor: functionalStatus === item.val ? 'primary.main' : 'divider' }}>
                  <FormControlLabel 
                    value={item.val} 
                    control={<Radio />} 
                    label={<Box sx={{ ml: 1 }}><Typography fontWeight={700}>{item.label}</Typography><Typography variant="caption" color="text.secondary">{item.desc}</Typography></Box>} 
                    sx={{ width: '100%', m: 0 }}
                  />
                </Paper>
              ))}
            </RadioGroup>
          </Box>
        );
      case 3:
        return (
          <Box textAlign="center" py={4}>
            {loading ? (
              <Box>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6">Calculando a melhor oferta para você...</Typography>
              </Box>
            ) : (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <VerifiedIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h4" fontWeight={900}>OFERTA REDECELL</Typography>
                <Typography variant="h2" color="primary" sx={{ fontWeight: 900, my: 3 }}>
                  R$ {buybackValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                  Este valor pode ser usado como crédito imediato para a compra de um novo aparelho ou pago via Pix após validação técnica em loja.
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button variant="contained" size="large" sx={{ borderRadius: '12px', px: 4, fontWeight: 700 }}>
                    Aceitar Oferta e Agendar
                  </Button>
                  <Button variant="outlined" size="large" onClick={() => setActiveStep(0)} sx={{ borderRadius: '12px', fontWeight: 700 }}>
                    Nova Avaliação
                  </Button>
                </Stack>
              </motion.div>
            )}
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
            Buyback Program
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Seu aparelho vale dinheiro na Redecell. Avaliação justa e pagamento imediato.
          </Typography>
        </Box>
        <CalcIcon sx={{ fontSize: 60, opacity: 0.1 }} />
      </Box>

      <Paper sx={{ p: { xs: 3, md: 6 }, borderRadius: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 8 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent(activeStep)}
          </motion.div>
        </AnimatePresence>

        {activeStep < 3 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ fontWeight: 700 }}
            >
              Voltar
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={activeStep === 0 && !selectedDevice}
              sx={{ borderRadius: '12px', px: 4, fontWeight: 700 }}
              endIcon={<ArrowIcon />}
            >
              {activeStep === steps.length - 2 ? 'Ver Resultado' : 'Próximo'}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Info Section */}
      <Grid container spacing={4} sx={{ mt: 8 }}>
        <Grid item xs={12} md={4}>
          <Box display="flex" gap={2}>
            <Avatar sx={{ bgcolor: 'success.light' }}><CheckIcon /></Avatar>
            <Box>
              <Typography fontWeight={800}>Avaliação na Hora</Typography>
              <Typography variant="caption" color="text.secondary">Nossa IA calcula o valor de mercado atualizado instantaneamente.</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box display="flex" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.light' }}><VerifiedIcon /></Avatar>
            <Box>
              <Typography fontWeight={800}>Segurança Total</Typography>
              <Typography variant="caption" color="text.secondary">Apagamos seus dados seguindo protocolos internacionais de segurança.</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box display="flex" gap={2}>
            <Avatar sx={{ bgcolor: 'warning.light' }}><CalcIcon /></Avatar>
            <Box>
              <Typography fontWeight={800}>Crédito ou Dinheiro</Typography>
              <Typography variant="caption" color="text.secondary">Escolha entre desconto em um novo ou Pix na conta.</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BuybackProgramPage;