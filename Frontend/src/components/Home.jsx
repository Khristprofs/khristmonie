import Nav from "./Nav";

function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 text-white pt-16">
            <Nav />
            
            <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
                {/* Hero Section */}
                <section className="max-w-3xl mx-auto mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                        The Leading money App.
                    </h1>
                    
                    <p className=" text-lg md:text-xl mb-8 opacity-90">
                        Make free transfers, enjoy cashless payment options and earn interest on your savings with Khristmonie. Making banking easy and accessible for everyone. 
                    </p>
                    
                    <div className="w-full h-1 bg-gradient-to-r from-pink-500 to-amber-400 rounded-full mb-2"></div>
                </section>
                
                {/* App Stores Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6">Download Now</h2>
                    
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-xl p-4 px-8 border border-white border-opacity-20 hover:bg-opacity-40 transition-all cursor-pointer">
                            <div className="flex items-center gap-3">
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                    <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                                </svg>
                                <div className="text-left">
                                    <p className="text-xs opacity-80">Download on the</p>
                                    <p className="text-xl font-semibold">App Store</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-xl p-4 px-8 border border-white border-opacity-20 hover:bg-opacity-40 transition-all cursor-pointer">
                            <div className="flex items-center gap-3">
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.25-.84-.76-.84-1.35zM14.5 12l7.15-7.15c.5-.25.85-.76.85-1.35v17c0-.59-.35-1.11-.85-1.35L14.5 12z"/>
                                </svg>
                                <div className="text-left">
                                    <p className="text-xs opacity-80">Get it on</p>
                                    <p className="text-xl font-semibold">Google Play</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Footer Section */}
                <section className="text-sm opacity-80">
                    <p className="mb-2">Khristmonie Inc.</p>
                    <p className="mb-1">Fully Licensed by the CBN</p>
                    <p>Deposits Insured by <span className="font-bold">INDIC</span></p>
                </section>
            </div>
            
            {/* Floating decorative elements */}
            <div className="fixed top-20 left-10 w-32 h-32 rounded-full bg-purple-600 opacity-20 blur-3xl -z-10"></div>
            <div className="fixed bottom-20 right-10 w-40 h-40 rounded-full bg-pink-600 opacity-20 blur-3xl -z-10"></div>
        </main>
    )
}

export default Home;