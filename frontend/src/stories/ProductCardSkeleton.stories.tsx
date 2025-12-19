import type { Meta, StoryObj } from '@storybook/react';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { Grid } from '@mui/material';

const meta = {
  title: 'Components/Loading/ProductCardSkeleton',
  component: ProductCardSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProductCardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const GridView: StoryObj = {
    render: () => (
        <Grid container spacing={2} sx={{width: '100vw'}}>
            {[...Array(4)].map((_, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                    <ProductCardSkeleton />
                </Grid>
            ))}
        </Grid>
    )
}