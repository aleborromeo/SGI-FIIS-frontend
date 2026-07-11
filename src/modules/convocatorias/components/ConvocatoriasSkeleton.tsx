import { Card, CardContent, Skeleton, Stack, Grid } from '@mui/material';

export function ConvocatoriasSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" mb={1.5}>
                <Skeleton variant="text" width={80} height={16} />
                <Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: 5 }} />
              </Stack>
              <Skeleton variant="text" width="90%" height={28} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="100%" height={16} />
              <Skeleton variant="text" width="100%" height={16} />
              <Skeleton variant="text" width="60%" height={16} sx={{ mt: 1 }} />
              <Skeleton variant="rounded" width="100%" height={40} sx={{ mt: 2, borderRadius: 1.5 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
