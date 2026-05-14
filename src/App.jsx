import { useEffect, useState } from 'react';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import './App.css';

const PAGE_PARAM = 'page';

function readPageFromUrl() {
  return new URLSearchParams(window.location.search).get(PAGE_PARAM);
}

export default function App() {
  const [currentPage, setCurrentPageState] = useState(readPageFromUrl);

  useEffect(() => {
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
