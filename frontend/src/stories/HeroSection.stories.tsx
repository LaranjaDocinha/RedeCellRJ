import type { Meta, StoryObj } from '@storybook/react';
import { HeroSection } from '../components/HeroSection';
import { Box, Typography } from '@mui/material';

const meta = {
  title: 'Components/HeroSection',
  component: HeroSection,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HeroSection>;

export default meta;

export const Default: StoryObj = {
    render: () => (
        <Box>
            <HeroSection 
                imageUrl="https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2070&auto=format&fit=crop"
                title="Tecnologia e Inovação"
                subtitle="Descubra os melhores produtos para o seu dia a dia."
            />
            <Box sx={{ height: '150vh', padding: 4 }}>
                <Typography variant="h4">Conteúdo da Página</Typography>
                <Typography>
                    Role para baixo para ver o efeito parallax na seção Hero acima. A imagem de fundo se moverá mais lentamente que o resto do conteúdo, criando uma sensação de profundidade.
                </Typography>
            </Box>
        </Box>
    )
}