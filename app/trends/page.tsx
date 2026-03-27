import { supabaseAdmin } from '@/lib/supabase/server';
import TrendsClient from '@/components/trends/TrendsClient';

export const revalidate = 3600;

export default async function TrendsPage() {
    // Fetch all industries (categories)
    const { data: industries } = await supabaseAdmin
        .from('industries')
        .select('*')
        .order('id');

    // Fetch all reports
    const { data: reports } = await supabaseAdmin
        .from('reports')
        .select('*')
        .order('published_at', { ascending: false });

    return (
        <TrendsClient 
            initialIndustries={industries || []} 
            initialReports={reports || []} 
        />
    );
}
