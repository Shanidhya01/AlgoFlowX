import React from "react";
import Navbar from "./Navbar";
import Hero from './Hero';
import SearchBar from './SearchBar';
import AlgorithmGrid from "./AlgorithmGrid";
import Dashboard from "./Dashboard";
import Footer from "./Footer";
import { SearchProvider, useSearch } from "../contexts/SearchContext";

function HomeContent() {
  const { searchTerm } = useSearch();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Dashboard />
        <SearchBar />
        <AlgorithmGrid searchTerm={searchTerm} />
      </main>
      <Footer />
    </div>
  );
}

function MainLayout() {
  return (
    <SearchProvider>
      <HomeContent />
    </SearchProvider>
  );
}

export default MainLayout;
