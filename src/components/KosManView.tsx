import React, { useState, useMemo } from 'react';
import { KosItem, KosCategory, SortOption } from '../types/kosman';
import { KOS_CATEGORIES } from '../data/kosmanItems';
import { 
  IconPlus, IconSearch, IconGrid, IconList, IconAlert, 
  IconCheckCircle, IconShoppingBag, IconTrash, IconEdit, 
  IconChevronUp, IconChevronDown, IconCopy, IconCheck 
} from './icons/SvgIcons';

interface KosManViewProps {
  items: KosItem[];
  onAddItem: (item: Omit<KosItem, 'id' | 'totalSpend'>) => void;
  onUpdateItem: (id: string, updates: Partial<KosItem>) => void;
  onDeleteItem: (id: string) => void;
  onOpenChatGPT: () => void;
  onOpenGoogleSheets: () => void;
}

export const KosManView: React.FC<KosManViewProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onOpenChatGPT,
  onOpenGoogleSheets,
}) => {
  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<KosCategory | 'Semua'>('Semua');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Modals & Drawers state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<KosItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedShoppingList, setCopiedShoppingList] = useState(false);
  const [showShoppingListDrawer, setShowShoppingListDrawer] = useState(false);

  // Form State for Add/Edit Modal
  const [formData, setFormData] = useState({
    name: '',
    category: 'Bumbu Dapur' as KosCategory,
    subCategory: 'Penyedap',
    quantity: 1,
    unit: 'buah',
    price: 10000,
    timesPurchased: 0,
    minThreshold: 1,
    notes: '',
  });

  // Calculate Auto-Recap Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const ok = items.filter(i => i.quantity > i.minThreshold).length;
    const low = items.filter(i => i.quantity > 0 && i.quantity <= i.minThreshold).length;
    const out = items.filter(i => i.quantity === 0).length;

    return { total, ok, low, out };
  }, [items]);

  // Shopping List items (Low or Out of Stock)
  const shoppingListItems = useMemo(() => {
    return items.filter(i => i.quantity <= i.minThreshold);
  }, [items]);

  // Available SubCategories based on selectedCategory
  const availableSubCategories = useMemo(() => {
    if (selectedCategory === 'Semua') {
      const allSubs = new Set<string>();
      KOS_CATEGORIES.forEach(c => c.subCategories.forEach(s => allSubs.add(s)));
      return Array.from(allSubs);
    }
    const cat = KOS_CATEGORIES.find(c => c.name === selectedCategory);
    return cat ? cat.subCategories : [];
  }, [selectedCategory]);

  // Filter & Sort Items
  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
        const matchesSubCategory = selectedSubCategory === 'Semua' || item.subCategory === selectedSubCategory;
        const matchesSearch = 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSubCategory && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'quantity-asc':
            return a.quantity - b.quantity;
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'timesPurchased-desc':
            return b.timesPurchased - a.timesPurchased;
          default:
            return 0;
        }
      });
  }, [items, selectedCategory, selectedSubCategory, searchQuery, sortBy]);

  // Quantity adjust (+ / -)
  const handleQuantityChange = (item: KosItem, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    const isPurchase = delta > 0;
    const newTimesPurchased = isPurchase ? item.timesPurchased + 1 : item.timesPurchased;

    onUpdateItem(item.id, {
      quantity: newQty,
      timesPurchased: newTimesPurchased,
      lastPurchasedDate: isPurchase ? new Date().toISOString().split('T')[0] : item.lastPurchasedDate
    });
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Bumbu Dapur',
      subCategory: 'Penyedap',
      quantity: 1,
      unit: 'buah',
      price: 10000,
      timesPurchased: 0,
      minThreshold: 1,
      notes: '',
    });
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: KosItem) => {
    setFormData({
      name: item.name,
      category: item.category,
      subCategory: item.subCategory,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      timesPurchased: item.timesPurchased,
      minThreshold: item.minThreshold,
      notes: item.notes || '',
    });
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      onUpdateItem(editingItem.id, {
        name: formData.name.trim(),
        category: formData.category,
        subCategory: formData.subCategory,
        quantity: Number(formData.quantity),
        unit: formData.unit.trim() || 'buah',
        price: Number(formData.price),
        timesPurchased: Number(formData.timesPurchased),
        minThreshold: Number(formData.minThreshold),
        notes: formData.notes,
      });
    } else {
      onAddItem({
        name: formData.name.trim(),
        category: formData.category,
        subCategory: formData.subCategory,
        quantity: Number(formData.quantity),
        unit: formData.unit.trim() || 'buah',
        price: Number(formData.price),
        timesPurchased: 0,
        minThreshold: Number(formData.minThreshold),
        lastPurchasedDate: new Date().toISOString().split('T')[0],
        notes: formData.notes,
      });
    }
    setShowAddModal(false);
  };

  const handleCopyShoppingList = () => {
    const listText = shoppingListItems
      .map(item => `- ${item.name} (${item.subCategory}, Stok: ${item.quantity} ${item.unit})`)
      .join('\n');
    
    const textToCopy = `📋 DAFTAR BELANJA KOSMAN (${shoppingListItems.length} barang):\n${listText}\n\nDicatat via ManageMe! KosMan`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedShoppingList(true);
    setTimeout(() => setCopiedShoppingList(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-3 sm:space-y-6">
      
      {/* Auto Recap Stat Cards (Scaled down on mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        
        <div className="bg-[#FFFDF6] border-2 sm:border-3 border-black p-2.5 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow">
          <span className="text-[10px] sm:text-xs font-black uppercase text-slate-600 block">Katalog Barang</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="font-display font-black text-lg sm:text-2xl text-black font-mono">{stats.total}</span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-500">Item</span>
          </div>
        </div>

        <div className="bg-[#A3E635] border-2 sm:border-3 border-black p-2.5 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow">
          <span className="text-[10px] sm:text-xs font-black uppercase text-black block">Stok Aman</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="font-display font-black text-lg sm:text-2xl text-black font-mono">{stats.ok}</span>
            <IconCheckCircle className="w-4 h-4 text-black" />
          </div>
        </div>

        <div className="bg-[#FFD000] border-2 sm:border-3 border-black p-2.5 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow">
          <span className="text-[10px] sm:text-xs font-black uppercase text-black block">Stok Menipis</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="font-display font-black text-lg sm:text-2xl text-black font-mono">{stats.low}</span>
            <IconAlert className="w-4 h-4 text-black" />
          </div>
        </div>

        <div className="bg-[#FF4B82] text-white border-2 sm:border-3 border-black p-2.5 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow">
          <span className="text-[10px] sm:text-xs font-black uppercase block">Stok Habis</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="font-display font-black text-lg sm:text-2xl text-white font-mono">{stats.out}</span>
            <span className="text-[10px] font-bold uppercase bg-black text-white px-1.5 py-0.2 rounded">Perlu Beli</span>
          </div>
        </div>

      </div>

      {/* Auto Shopping Recap Banner Drawer */}
      {shoppingListItems.length > 0 && (
        <div className="bg-[#FFD000] border-2 sm:border-3 border-black p-3 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-9 sm:h-9 bg-black text-[#FFD000] rounded-lg sm:rounded-xl flex items-center justify-center font-black comic-shadow-sm shrink-0">
                <IconShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-xs sm:text-base text-black uppercase">
                  {shoppingListItems.length} BARANG PERLU DIBELI!
                </h3>
                <p className="text-[10px] sm:text-xs font-bold text-slate-900">
                  {stats.out} barang habis total & {stats.low} barang di batas minimum.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleCopyShoppingList}
                className="comic-button bg-white text-black px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border sm:border-2 border-black font-bold text-[10px] sm:text-xs flex items-center gap-1"
              >
                {copiedShoppingList ? <IconCheck className="w-3.5 h-3.5 text-green-600" /> : <IconCopy className="w-3.5 h-3.5" />}
                {copiedShoppingList ? 'Tersalin!' : 'Salin Belanja'}
              </button>

              <button
                onClick={() => setShowShoppingListDrawer(!showShoppingListDrawer)}
                className="comic-button bg-black text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border sm:border-2 border-black font-bold text-[10px] sm:text-xs flex items-center gap-1"
              >
                {showShoppingListDrawer ? <IconChevronUp className="w-3.5 h-3.5" /> : <IconChevronDown className="w-3.5 h-3.5" />}
                {showShoppingListDrawer ? 'Tutup' : 'Lihat List'}
              </button>
            </div>
          </div>

          {showShoppingListDrawer && (
            <div className="bg-white border-2 border-black p-3 rounded-xl space-y-2 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pt-1">
                {shoppingListItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-slate-50 border border-black px-2 py-1 rounded-lg text-xs font-bold">
                    <span className="truncate pr-1.5 text-black">{item.name}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-mono ${
                      item.quantity === 0 ? 'bg-[#FF4B82] text-white' : 'bg-[#FFD000] text-black'
                    }`}>
                      {item.quantity === 0 ? 'HABIS' : `${item.quantity} ${item.unit}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Control Toolbar: Search, Filters, Pop Comic Dropdowns */}
      <div className="bg-white border-2 sm:border-3 border-black p-3 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow space-y-2.5 sm:space-y-3">
        
        {/* Row 1: Search & Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <IconSearch className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari bumbu dapur, obat, galon, mie..."
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-[#FFFDF6] border-2 border-black rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#00E5FF] comic-shadow-sm"
            />
          </div>

          {/* Action Buttons & Dropdowns */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#FFFDF6] border sm:border-2 border-black p-0.5 rounded-lg sm:rounded-xl comic-shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 sm:p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-[#00E5FF] text-black border border-black' : 'text-slate-600 hover:text-black'
                }`}
                title="Tampilan Grid Kartu"
              >
                <IconGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1 sm:p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-[#00E5FF] text-black border border-black' : 'text-slate-600 hover:text-black'
                }`}
                title="Tampilan Tabel"
              >
                <IconList className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pop Comic Unified Dropdown: Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-[#FFFDF6] border sm:border-2 border-black px-2.5 sm:px-3 py-1.5 sm:py-2 pr-7 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs cursor-pointer focus:outline-none shadow-[2px_2px_0px_#000]"
              >
                <option value="name-asc">Nama (A - Z)</option>
                <option value="name-desc">Nama (Z - A)</option>
                <option value="quantity-asc">Stok Terendah</option>
                <option value="price-asc">Harga Termurah</option>
                <option value="price-desc">Harga Tertinggi</option>
              </select>
              <IconChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-black" />
            </div>

            {/* Add Item Button */}
            <button
              onClick={handleOpenAdd}
              className="comic-button bg-[#FF4B82] text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border sm:border-2 border-black font-black text-[10px] sm:text-xs flex items-center gap-1 uppercase comic-shadow-sm shrink-0"
            >
              <IconPlus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        {/* Row 2: Category Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => { setSelectedCategory('Semua'); setSelectedSubCategory('Semua'); }}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all border sm:border-2 ${
              selectedCategory === 'Semua'
                ? 'bg-[#FFD000] text-black border-black shadow-[1px_1px_0px_#000]'
                : 'bg-[#FFFDF6] text-slate-700 border-black hover:bg-slate-100'
            }`}
          >
            Semua ({items.length})
          </button>

          {KOS_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => { setSelectedCategory(cat.name); setSelectedSubCategory('Semua'); }}
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all border sm:border-2 ${
                selectedCategory === cat.name
                  ? 'bg-[#FFD000] text-black border-black shadow-[1px_1px_0px_#000]'
                  : 'bg-[#FFFDF6] text-slate-700 border-black hover:bg-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Row 3: Sub-Category Filter Dropdown / Pills */}
        {availableSubCategories.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-black uppercase text-slate-500 shrink-0">Sub:</span>
            
            <button
              onClick={() => setSelectedSubCategory('Semua')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                selectedSubCategory === 'Semua' ? 'bg-[#00E5FF] text-black border-black' : 'bg-slate-50 text-slate-600 border-slate-300'
              }`}
            >
              Semua Sub
            </button>

            {availableSubCategories.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubCategory(sub)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap border transition-all ${
                  selectedSubCategory === sub ? 'bg-[#00E5FF] text-black border-black' : 'bg-slate-50 text-slate-600 border-slate-300'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Main Items Display (Grid or Table) */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold text-slate-600 uppercase">
            Menampilkan <span className="font-mono font-black text-black">{filteredItems.length}</span> barang
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-8 text-center comic-shadow space-y-2">
            <div className="w-12 h-12 bg-[#FFD000] border-2 border-black rounded-xl flex items-center justify-center mx-auto comic-shadow-sm">
              <IconSearch className="w-6 h-6 text-black" />
            </div>
            <h3 className="font-display font-black text-base uppercase text-black">TIDAK ADA BARANG DITEMUKAN</h3>
            <p className="text-xs font-bold text-slate-600">Coba ubah kata kunci atau ganti filter kategori/sub-kategori.</p>
          </div>
        ) : viewMode === 'grid' ? (
          
          /* GRID VIEW */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
            {filteredItems.map(item => {
              const isOut = item.quantity === 0;
              const isLow = item.quantity > 0 && item.quantity <= item.minThreshold;

              return (
                <div 
                  key={item.id}
                  className={`bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 comic-shadow flex flex-col justify-between space-y-2 relative group transition-all ${
                    isOut ? 'border-red-600 bg-red-50/20' : isLow ? 'bg-amber-50/30' : ''
                  }`}
                >
                  {/* Category & Status */}
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase bg-[#FFFDF6] border border-black px-1.5 py-0.2 rounded truncate max-w-[90px]">
                      {item.subCategory}
                    </span>

                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full border border-black ${
                      isOut 
                        ? 'bg-[#FF4B82] text-white' 
                        : isLow 
                        ? 'bg-[#FFD000] text-black' 
                        : 'bg-[#A3E635] text-black'
                    }`}>
                      {isOut ? 'HABIS' : isLow ? 'LOW' : 'AMAN'}
                    </span>
                  </div>

                  {/* Clean Item Name & Price (No bulky packaging info) */}
                  <div className="min-h-[44px]">
                    <h4 className="font-display font-black text-xs sm:text-sm text-black leading-tight line-clamp-2">
                      {item.name}
                    </h4>
                    <p className="text-[10px] sm:text-xs font-mono font-bold text-slate-600 mt-0.5">
                      Rp {item.price.toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                    <div className="flex items-center justify-between bg-[#FFFDF6] border sm:border-2 border-black p-1 rounded-lg sm:rounded-xl">
                      <button
                        onClick={() => handleQuantityChange(item, -1)}
                        className="w-5 h-5 sm:w-6 sm:h-6 bg-white hover:bg-slate-100 border border-black rounded font-black text-xs text-black flex items-center justify-center active:scale-95"
                        title="Kurangi Stok (-1)"
                      >
                        -
                      </button>

                      <div className="text-center font-mono">
                        <span className="font-black text-xs sm:text-sm text-black block leading-none">
                          {item.quantity}
                        </span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase">
                          {item.unit}
                        </span>
                      </div>

                      <button
                        onClick={() => handleQuantityChange(item, 1)}
                        className="w-5 h-5 sm:w-6 sm:h-6 bg-[#00E5FF] hover:bg-cyan-300 border border-black rounded font-black text-xs text-black flex items-center justify-center active:scale-95"
                        title="Tambah Stok (+1)"
                      >
                        +
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1 pt-0.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 text-slate-500 hover:text-black"
                        title="Edit Barang"
                      >
                        <IconEdit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                        title="Hapus Barang"
                      >
                        <IconTrash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        ) : (

          /* TABLE VIEW */
          <div className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl comic-shadow overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFD000] border-b-2 border-black font-display font-black uppercase text-black text-[11px]">
                <tr>
                  <th className="p-2.5">Nama Barang</th>
                  <th className="p-2.5">Kategori & Sub</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5 text-center">Stok</th>
                  <th className="p-2.5 text-right">Harga Satuan</th>
                  <th className="p-2.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black font-bold">
                {filteredItems.map(item => {
                  const isOut = item.quantity === 0;
                  const isLow = item.quantity > 0 && item.quantity <= item.minThreshold;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-2.5">
                        <span className="font-black text-black">{item.name}</span>
                      </td>
                      <td className="p-2.5">
                        <span className="bg-[#FFFDF6] border border-black px-1.5 py-0.2 rounded text-[10px]">
                          {item.category} · {item.subCategory}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border border-black ${
                          isOut ? 'bg-[#FF4B82] text-white' : isLow ? 'bg-[#FFD000] text-black' : 'bg-[#A3E635] text-black'
                        }`}>
                          {isOut ? 'HABIS' : isLow ? 'LOW' : 'AMAN'}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="inline-flex items-center gap-1 bg-[#FFFDF6] border border-black p-0.5 rounded">
                          <button onClick={() => handleQuantityChange(item, -1)} className="w-4 h-4 bg-white border border-black text-xs font-black">-</button>
                          <span className="font-mono px-1.5 text-xs">{item.quantity} {item.unit}</span>
                          <button onClick={() => handleQuantityChange(item, 1)} className="w-4 h-4 bg-[#00E5FF] border border-black text-xs font-black">+</button>
                        </div>
                      </td>
                      <td className="p-2.5 text-right font-mono text-black">
                        Rp {item.price.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleOpenEdit(item)} className="p-1 text-slate-700 hover:text-black">
                            <IconEdit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteConfirmId(item.id)} className="p-1 text-red-500 hover:text-red-700">
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border-2 sm:border-3 border-black rounded-2xl p-4 sm:p-5 max-w-md w-full space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="font-display font-black text-base uppercase text-black">
                {editingItem ? 'EDIT BARANG KOSMAN' : 'TAMBAH BARANG KOSMAN'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="font-bold text-slate-500 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 uppercase mb-1">Nama Barang *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Mi Goreng, Air Galon, Pocari Sweat"
                  className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 uppercase mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value as KosCategory;
                      const catObj = KOS_CATEGORIES.find(c => c.name === newCat);
                      setFormData({ 
                        ...formData, 
                        category: newCat,
                        subCategory: catObj ? catObj.subCategories[0] : 'Umum'
                      });
                    }}
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-xl font-bold bg-white text-xs"
                  >
                    {KOS_CATEGORIES.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 uppercase mb-1">Sub-Kategori</label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-xl font-bold bg-white text-xs"
                  >
                    {(KOS_CATEGORIES.find(c => c.name === formData.category)?.subCategories || []).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 uppercase mb-1">Stok</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 uppercase mb-1">Satuan</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="buah/bungkus"
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 uppercase mb-1">Harga (IDR)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border-2 border-black rounded-xl font-bold text-xs hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="comic-button bg-[#FFD000] text-black px-4 py-1.5 border-2 border-black rounded-xl font-black text-xs uppercase"
                >
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
          <div className="bg-white border-2 sm:border-3 border-black rounded-2xl p-4 sm:p-5 max-w-sm w-full space-y-3 text-center">
            <h3 className="font-display font-black text-base uppercase text-black">Hapus Barang Ini?</h3>
            <p className="text-xs font-bold text-slate-600">Barang ini akan dihapus dari inventaris lokal.</p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 border-2 border-black rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteItem(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="comic-button bg-[#FF4B82] text-white px-4 py-1.5 border-2 border-black rounded-xl font-black text-xs uppercase"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
