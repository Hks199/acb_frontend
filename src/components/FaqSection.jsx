import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { axiosClient } from '../utils/axiosClient';

export default function FaqSection({ standalone = false }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    const refresh = async () => {
      if (pending || document.visibilityState === 'hidden') return;
      pending = true;
      try {
        const response = await axiosClient.get('faqs', { signal: controller.signal });
        if (!Array.isArray(response.data)) throw new Error('Invalid FAQ response');
        if (!controller.signal.aborted) { setRows(response.data); setError(false); }
      } catch {
        if (!controller.signal.aborted) { setRows([]); setError(true); }
      } finally {
        pending = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    refresh();
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [retry]);

  const Heading = standalone ? 'h1' : 'h2';
  return <section id="faq" aria-labelledby="faq-heading" className={`px-4 py-12 md:py-16 ${standalone ? 'min-h-[60vh]' : 'mt-20'} bg-[#fff7f8] text-[#2C2C2C]`}>
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-sm font-semibold text-[#d62f66] mb-2">HERE TO HELP</p>
        <Heading id="faq-heading" className="text-2xl md:text-3xl font-semibold">Frequently asked questions</Heading>
        <p className="mt-3 text-[#666]">Find helpful answers before you get in touch.</p>
      </div>
      {loading && <p role="status" className="text-center">Loading FAQs...</p>}
      {error && <div role="alert" className="text-center">
        <p>We couldn't load the FAQs. Please try again.</p>
        <button type="button" onClick={() => { setLoading(true); setRetry(value => value + 1); }} className="mt-3 underline text-[#d62f66] cursor-pointer">Try again</button>
      </div>}
      {!loading && !error && !rows.length && <p className="text-center text-[#666]">Have a question? Our team is happy to help.</p>}
      <div className="space-y-3">
        {rows.map(row => <details key={row._id} className="group bg-white border border-[#f3dce2] rounded-xl overflow-hidden">
          <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 font-semibold focus-visible:outline-2 focus-visible:outline-[#d62f66]">
            <span className="min-w-0 break-words">{row.question}</span>
            <span aria-hidden="true" className="text-[#d62f66] text-xl shrink-0 group-open:rotate-45 transition-transform">+</span>
          </summary>
          <div className="px-5 pb-5 text-[#555] whitespace-pre-wrap break-words leading-relaxed">{row.answer}</div>
        </details>)}
      </div>
      <p className="mt-8 text-center text-[#666]">Still need help? <Link to="/#contact" className="text-[#d62f66] font-semibold underline">Contact us</Link>
        {!standalone && <> · <Link to="/faq" className="text-[#d62f66] font-semibold underline">Visit FAQ page</Link></>}
      </p>
    </div>
  </section>;
}
