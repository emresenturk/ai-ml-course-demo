import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, XMarkIcon, HandThumbUpIcon, HandThumbDownIcon, TrashIcon, ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolid } from '@heroicons/react/24/solid';
import { getFitRecommendation, SAMPLE_CUSTOMER, CATALOG_PRODUCTS, AVAILABLE_PRODUCTS, type RecommendationResponse, type CustomerData, type Order, type ProductAttributes } from './mockBackend';

function App() {
  const [view, setView] = useState<'catalog' | 'pdp' | 'profile'>('catalog');
  const [customer, setCustomer] = useState<CustomerData>(SAMPLE_CUSTOMER);
  const [currentProduct, setCurrentProduct] = useState<ProductAttributes>(CATALOG_PRODUCTS[0]);
  
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);

  // Reset selected size when product changes
  useEffect(() => {
    setSelectedSize(null);
  }, [currentProduct]);

  const availableSizes = Object.keys(currentProduct.inventory).map(Number).sort((a, b) => a - b);

  const handleFindFit = async () => {
    setIsModalOpen(true);
    setIsLoading(true);
    setRecommendation(null);
    setFeedbackGiven(null);

    // Call API using the dynamic customer state and current product
    const result = await getFitRecommendation(customer, currentProduct);
    setRecommendation(result);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-orange-200">
      {/* Top Navigation */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white sticky top-0 z-10 border-b border-neutral-100 shadow-sm">
        <div className="text-3xl font-black italic tracking-tighter cursor-pointer" onClick={() => setView('catalog')}>NIKE</div>
        <div className="hidden md:flex space-x-6 text-sm font-medium">
          <a href="#" className="hover:text-gray-500 transition-colors">New Releases</a>
          <a href="#" className="hover:text-gray-500 transition-colors">Men</a>
          <a href="#" className="hover:text-gray-500 transition-colors">Women</a>
          <a href="#" className="hover:text-gray-500 transition-colors">Kids</a>
          <a href="#" className="hover:text-gray-500 transition-colors">Sale</a>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => setView('profile')}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs overflow-hidden cursor-pointer border-2 transition-all ${view === 'profile' ? 'border-neutral-900 ring-2 ring-neutral-200' : 'border-neutral-200 hover:border-neutral-900'}`}
            title="Edit Profile & History"
          >
            <img src="https://i.pravatar.cc/100?img=33" alt="Profile" className="w-full h-full object-cover"/>
          </button>
        </div>
      </nav>

      {view === 'catalog' ? (
        /* -------------------------------------------------------------
           CATALOG VIEW
           ------------------------------------------------------------- */
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-black mb-8 tracking-tight">Latest Drops</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CATALOG_PRODUCTS.map(product => (
              <div 
                key={product.id} 
                className="cursor-pointer group" 
                onClick={() => {
                  setCurrentProduct(product);
                  setView('pdp');
                }}
              >
                <div className="aspect-[4/3] bg-[#f5f5f5] rounded-2xl overflow-hidden mb-4 relative">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
                </div>
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-neutral-500 font-medium">{product.silhouette}</p>
                <p className="font-medium mt-1">${product.price}</p>
              </div>
            ))}
          </div>
        </main>
      ) : view === 'pdp' ? (
        /* -------------------------------------------------------------
           PRODUCT DETAIL PAGE VIEW
           ------------------------------------------------------------- */
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
          {/* Left Column: Product Images */}
          <div className="lg:w-2/3 space-y-4">
            <div className="aspect-[4/3] bg-[#f5f5f5] rounded-2xl overflow-hidden group relative">
              <img 
                src={currentProduct.images[0]} 
                alt={currentProduct.name} 
                className="w-full h-full object-cover object-center mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square bg-[#f5f5f5] rounded-2xl overflow-hidden">
                <img src={currentProduct.images[0]} alt="Detail 1" className="w-full h-full object-cover mix-blend-multiply scale-150 origin-bottom-left"/>
              </div>
              <div className="aspect-square bg-[#f5f5f5] rounded-2xl overflow-hidden">
                <img src={currentProduct.images[0]} alt="Detail 2" className="w-full h-full object-cover mix-blend-multiply scale-150 origin-top-right"/>
              </div>
            </div>
          </div>

          {/* Right Column: Product Details & Size Selector */}
          <div className="lg:w-1/3 flex flex-col">
            <div className="mb-2 text-sm font-bold text-[#ff6600]">Highly Rated</div>
            <h1 className="text-3xl font-black text-neutral-900 mb-1 tracking-tight">{currentProduct.name}</h1>
            <p className="text-neutral-500 font-medium mb-4">{currentProduct.silhouette}</p>
            <div className="text-xl font-medium mb-8">${currentProduct.price}</div>

            {/* Size Section */}
            <div className="mb-8">
              <div className="flex justify-between items-baseline mb-4">
                <h2 className="font-semibold text-lg">Select Size</h2>
                
                {/* Find Your Fit Button */}
                <button 
                  onClick={handleFindFit}
                  className="flex items-center text-sm font-bold text-[#ff6600] hover:text-[#cc5200] transition-colors group"
                >
                  <SparklesSolid className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                  Find Your Fit
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {availableSizes.map(size => {
                  const isOutOfStock = currentProduct.inventory[size] === 0;
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 px-4 rounded-lg border text-center transition-all ${
                        isOutOfStock 
                          ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed opacity-60 line-through' 
                          : isSelected 
                            ? 'border-neutral-900 ring-1 ring-neutral-900 bg-neutral-900 text-white shadow-md' 
                            : 'border-neutral-200 hover:border-neutral-900 text-neutral-900 bg-white hover:bg-neutral-50'
                      }`}
                    >
                      US {size}
                    </button>
                  )
                })}
              </div>
              
              {selectedSize && currentProduct.inventory[selectedSize] === 0 && (
                <p className="mt-3 text-sm text-red-500 font-medium">This size is out of stock.</p>
              )}
            </div>

            <button className="w-full bg-neutral-900 text-white py-4 rounded-full font-bold hover:bg-black transition-colors shadow-lg shadow-neutral-200 mb-4">
              Add to Bag
            </button>
            <button className="w-full bg-white text-neutral-900 border border-neutral-300 py-4 rounded-full font-bold hover:border-neutral-900 transition-colors">
              Favorite
            </button>
            
            <p className="mt-8 text-neutral-500 text-sm leading-relaxed border-t border-neutral-200 pt-6">
              This {currentProduct.silhouette.toLowerCase()} silhouette features premium {currentProduct.material.toLowerCase()} materials. Tags: {currentProduct.tags.join(', ')}.
            </p>
          </div>
        </main>
      ) : (
        /* -------------------------------------------------------------
           PROFILE & ORDER HISTORY VIEW
           ------------------------------------------------------------- */
        <ProfileEditor 
          customer={customer} 
          setCustomer={setCustomer} 
          onBack={() => setView('pdp')} 
        />
      )}

      {/* Nike Fit Intelligence Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-40"
              onClick={() => setIsModalOpen(false)}
            />
            
            {/* Modal Content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
              <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto border border-neutral-200"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 p-6 flex justify-between items-start border-b border-orange-100">
                  <div>
                    <div className="flex items-center text-[#ff6600] font-bold tracking-wide text-xs mb-1.5 uppercase">
                      <SparklesIcon className="w-4 h-4 mr-1" />
                      Nike Fit Intelligence
                    </div>
                    <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Your Perfect Fit</h3>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 bg-white/80 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-white transition-colors shadow-sm"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6">
                  {isLoading ? (
                    <div className="py-16 flex flex-col items-center justify-center text-neutral-500">
                      <div className="w-12 h-12 border-4 border-orange-200 border-t-[#ff6600] rounded-full animate-spin mb-4"></div>
                      <p className="font-semibold animate-pulse tracking-wide">Analyzing your fit profile...</p>
                    </div>
                  ) : recommendation ? (
                    <div className="space-y-6">
                      {/* Recommended Size Display */}
                      <div className="text-center">
                        <button 
                          onClick={() => {
                            if (!recommendation.inventory_warning) {
                              setSelectedSize(recommendation.recommended_size);
                              setIsModalOpen(false);
                            } else {
                              setSelectedSize(recommendation.fallback_size || recommendation.recommended_size);
                              setIsModalOpen(false);
                            }
                          }}
                          className="inline-block px-10 py-5 bg-neutral-900 text-white rounded-[1.5rem] shadow-xl shadow-neutral-300 transform transition-all hover:scale-105 active:scale-95 hover:bg-black group relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="block text-sm font-semibold text-neutral-300 mb-1 uppercase tracking-wider">Select Advised Fit</span>
                          <span className="block text-5xl font-black tracking-tighter">Size {recommendation.recommended_size}</span>
                        </button>
                      </div>

                      {/* Confidence Score */}
                      <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 shadow-sm">
                        <div className="flex justify-between items-end mb-2.5">
                          <span className="text-sm font-bold text-neutral-700">Model Confidence</span>
                          <span className="text-sm font-black text-green-600">{recommendation.confidence_score}%</span>
                        </div>
                        <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${recommendation.confidence_score}%` }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                            className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                          />
                        </div>
                      </div>

                      {/* GenAI Explanation */}
                      <div className="bg-[#ff6600]/5 rounded-2xl p-5 border border-[#ff6600]/20 relative">
                        <div className="absolute -left-1 -top-1">
                          <span className="flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6600] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff6600]"></span>
                          </span>
                        </div>
                        <p className="text-neutral-800 text-[15px] font-medium leading-relaxed italic">
                          "{recommendation.explanation}"
                        </p>
                      </div>
                      
                      {/* Rules Engine Warning (Out of Stock) */}
                      {recommendation.inventory_warning && (
                        <div className="bg-red-50 text-red-800 p-4 rounded-xl text-sm font-semibold border border-red-200 flex items-start shadow-sm">
                          <svg className="w-5 h-5 mr-2 shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Your true size ({recommendation.fallback_size}) is out of stock. We've adjusted your recommendation to the next best available size.
                        </div>
                      )}

                      {/* Feedback Loop */}
                      <div className="pt-5 border-t border-neutral-100">
                        <p className="text-center text-sm font-bold text-neutral-400 mb-3 uppercase tracking-wider">Was this helpful?</p>
                        <div className="flex justify-center space-x-3">
                          <button 
                            onClick={() => setFeedbackGiven('yes')}
                            className={`flex items-center justify-center px-5 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                              feedbackGiven === 'yes' 
                                ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' 
                                : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                            }`}
                          >
                            <HandThumbUpIcon className="w-5 h-5 mr-2" strokeWidth={2} />
                            Yes
                          </button>
                          <button 
                            onClick={() => setFeedbackGiven('no')}
                            className={`flex items-center justify-center px-5 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                              feedbackGiven === 'no' 
                                ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' 
                                : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                            }`}
                          >
                            <HandThumbDownIcon className="w-5 h-5 mr-2" strokeWidth={2} />
                            No
                          </button>
                        </div>
                        <AnimatePresence>
                          {feedbackGiven && (
                            <motion.p 
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-center text-xs font-semibold text-neutral-500 mt-4"
                            >
                              Thanks! Your feedback helps us improve future recommendations.
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------------------------------
// PROFILE EDITOR COMPONENT
// ----------------------------------------------------------------------------
function ProfileEditor({ 
  customer, 
  setCustomer, 
  onBack 
}: { 
  customer: CustomerData, 
  setCustomer: React.Dispatch<React.SetStateAction<CustomerData>>, 
  onBack: () => void 
}) {
  
  const [draftHistory, setDraftHistory] = useState<Order[]>(customer.order_history);

  const handleProductChange = (index: number, productName: string) => {
    const newHistory = [...draftHistory];
    const catalogItem = AVAILABLE_PRODUCTS.find(p => p.name === productName);
    newHistory[index] = {
      ...newHistory[index],
      product_name: productName,
      silhouette: catalogItem ? catalogItem.silhouette : 'Lifestyle'
    };
    setDraftHistory(newHistory);
  };

  const handleSizeChange = (index: number, size: number) => {
    const newHistory = [...draftHistory];
    newHistory[index].size = size;
    setDraftHistory(newHistory);
  };

  const handleReturnToggle = (index: number, isReturned: boolean) => {
    const newHistory = [...draftHistory];
    newHistory[index].status = isReturned ? 'returned' : 'kept';
    if (!isReturned) {
      newHistory[index].return_reason = undefined;
    }
    setDraftHistory(newHistory);
  };

  const handleReasonChange = (index: number, reason: string) => {
    const newHistory = [...draftHistory];
    newHistory[index].return_reason = reason;
    setDraftHistory(newHistory);
  };

  const removeOrder = (index: number) => {
    const newHistory = draftHistory.filter((_, i) => i !== index);
    setDraftHistory(newHistory);
  };

  const addOrder = () => {
    setDraftHistory([
      ...draftHistory, 
      {
        id: `ORD-${Math.floor(Math.random() * 10000)}`,
        product_name: AVAILABLE_PRODUCTS[0].name,
        silhouette: AVAILABLE_PRODUCTS[0].silhouette,
        size: 10,
        status: 'kept'
      }
    ]);
  };

  const handleSave = () => {
    setCustomer({
      ...customer,
      order_history: draftHistory
    });
    onBack();
  };

  return (
    <motion.main 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl mx-auto px-4 py-10"
    >
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack}
          className="mr-4 p-2 rounded-full hover:bg-neutral-200 transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Your Fit Profile</h1>
          <p className="text-neutral-500 font-medium">Edit your purchase history to tune the AI recommendation.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <div className="flex justify-between items-center mb-6 border-b border-neutral-100 pb-4">
          <h2 className="text-xl font-bold">Purchase History</h2>
          <button 
            onClick={addOrder}
            className="flex items-center text-sm font-bold text-neutral-900 bg-neutral-100 px-3 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Add Sneaker
          </button>
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {draftHistory.map((order, index) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 relative group"
              >
                <button 
                  onClick={() => removeOrder(index)}
                  className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors"
                  title="Remove this order"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pr-8">
                  <div className="md:col-span-5">
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Product</label>
                    <select 
                      value={order.product_name}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none"
                    >
                      {AVAILABLE_PRODUCTS.map(p => (
                        <option key={p.name} value={p.name}>{p.name} ({p.silhouette})</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Size</label>
                    <input 
                      type="number" 
                      step="0.5"
                      min="4" max="18"
                      value={order.size}
                      onChange={(e) => handleSizeChange(index, parseFloat(e.target.value))}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center pt-5">
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={order.status === 'returned'}
                        onChange={(e) => handleReturnToggle(index, e.target.checked)}
                        className="w-5 h-5 rounded border-neutral-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm font-bold text-neutral-700">Returned</span>
                    </label>
                  </div>

                  {order.status === 'returned' && (
                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Reason</label>
                      <input 
                        type="text" 
                        placeholder="e.g. too small"
                        value={order.return_reason || ''}
                        onChange={(e) => handleReasonChange(index, e.target.value)}
                        className="w-full bg-white border border-red-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-red-900"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {draftHistory.length === 0 && (
            <p className="text-center text-neutral-400 py-4 italic">No order history. The AI will recommend your standard true size.</p>
          )}
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button 
            onClick={onBack}
            className="px-6 py-3 border border-neutral-300 text-neutral-700 font-bold rounded-full hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-3 bg-neutral-900 text-white font-bold rounded-full hover:bg-black transition-colors shadow-md"
          >
            Save Profile
          </button>
        </div>
      </div>
    </motion.main>
  );
}

export default App;
