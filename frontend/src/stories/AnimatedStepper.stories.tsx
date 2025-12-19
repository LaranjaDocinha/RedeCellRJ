import type { Meta, StoryObj } from '@storybook/react';
import { AnimatedStepper } from '../components/AnimatedStepper';
import { Typography, TextField, Stack } from '@mui/material';

const steps = [
  {
    label: 'Informações Pessoais',
    content: (
        <Stack spacing={2}>
            <Typography>Nos diga um pouco sobre você.</Typography>
            <TextField label="Nome Completo" variant="outlined" />
            <TextField label="Email" variant="outlined" />
        </Stack>
    )
  },
  {
    label: 'Endereço de Entrega',
    content: (
        <Stack spacing={2}>
            <Typography>Onde devemos entregar seu pedido?</Typography>
            <TextField label="Endereço" variant="outlined" />
            <TextField label="Cidade" variant="outlined" />
            <TextField label="CEP" variant="outlined" />
        </Stack>
    )
  },
  {
    label: 'Detalhes do Pagamento',
    content: (
        <Stack spacing={2}>
            <Typography>Como você gostaria de pagar?</Typography>
            <TextField label="Número do Cartão" variant="outlined" />
            <TextField label="Validade" variant="outlined" />
            <TextField label="CVV" variant="outlined" />
        </Stack>
    )
  },
];


const meta = {
  title: 'Components/AnimatedStepper',
  component: AnimatedStepper,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AnimatedStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CheckoutFlow: Story = {
  args: {
    steps: steps,
  },
};