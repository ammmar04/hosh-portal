import { notFound } from 'next/navigation';

// Any unknown path under /en or /ur renders the localized not-found page.
export default function CatchAll() {
  notFound();
}
