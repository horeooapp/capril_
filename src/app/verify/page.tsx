import { redirect } from 'next/navigation';

export default function VerifyRedirectPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  redirect('/verifier');
}

