import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from '../components/Accordion';
import { Box, Typography } from '@mui/material';

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;

export const FAQ: StoryObj = {
    render: () => (
        <Box width={600}>
            <Accordion title="Qual é a política de devolução?">
                <Typography>
                    Nossa política de devolução permite que você devolva qualquer item dentro de 30 dias após a compra, desde que esteja em sua condição original. Para iniciar uma devolução, entre em contato com nosso suporte ao cliente.
                </Typography>
            </Accordion>
            <Accordion title="Como rastrear meu pedido?">
                <Typography>
                    Assim que seu pedido for enviado, você receberá um email de confirmação com um número de rastreamento. Você pode usar este número no site da transportadora para acompanhar o progresso da sua entrega.
                </Typography>
            </Accordion>
            <Accordion title="Vocês oferecem frete internacional?">
                <Typography>
                    Atualmente, não oferecemos frete internacional. Enviamos apenas para endereços dentro do Brasil.
                </Typography>
            </Accordion>
        </Box>
    )
}