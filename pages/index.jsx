import { useEffect, useState } from 'react';
import Header from '../src/components/Header';
import MainContent from '../src/components/MainContent';
import Footer from '../src/components/Footer';

const PAGE_PARAM = 'page';

function readPageFromUrl() {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(PAGE_PARAM);
}

export default function Home() {
  const [currentPage, setCurrentPageState] = useState(null);

  useEffect(() => {
    setCurrentPageState(readPageFromUrl());
    function handlePopState() {
      setCurrentPageState(readPageFromUrl());
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function setCurrentPage(page) {
    const url = new URL(window.location.href);
    if (page) url.searchParams.set(PAGE_PARAM, page);
    else url.searchParams.delete(PAGE_PARAM);
    window.history.pushState({}, '', url);
    setCurrentPageState(page);
  }

  return (
    <div className="app">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <MainContent currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <Footer />
    </div>
  );
}
