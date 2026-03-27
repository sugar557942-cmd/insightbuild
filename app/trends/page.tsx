import { supabaseAdmin } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server-client';
import TrendsClient from '@/components/trends/TrendsClient';

export const revalidate = 3600;

export default async function TrendsPage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const isLoggedIn = !!session;

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
            isLoggedIn={isLoggedIn}
        />
    );
}
