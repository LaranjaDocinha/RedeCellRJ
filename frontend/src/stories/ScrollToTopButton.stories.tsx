import type { Meta, StoryObj } from '@storybook/react';
import { ScrollToTopButton } from '../components/ScrollToTopButton';
import { Box, Typography } from '@mui/material';

const meta = {
  title: 'Components/ScrollToTopButton',
  component: ScrollToTopButton,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollToTopButton>;

export default meta;

export const Default: StoryObj = {
    render: () => (
        <Box>
            <Box sx={{ height: '200vh', padding: 4 }}>
                <Typography variant="h4">Página Longa</Typography>
                <Typography>
                    Role para baixo para ver o botão "Scroll to Top" aparecer no canto inferior direito. Clicar nele levará você de volta ao topo suavemente.
                </Typography>
            </Box>
            <ScrollToTopButton />
        </Box>
    )
}