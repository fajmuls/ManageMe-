import React, { useState, useMemo } from 'react';
import { KosItem, KosCategory, SortOption, WishlistItem, WishlistPriority, BudgetPos } from '../types/kosman';
import { KOS_CATEGORIES } from '../data/kosmanItems';
import { 
  IconPlus, IconSearch, IconGrid, IconList, IconAlert, 
  IconCheckCircle, IconShoppingBag, IconTrash, IconEdit, 
  IconChevronUp, IconChevronDown, IconCopy, IconCheck,
  IconSheet, IconBot, IconWallet, IconSparkles
} from './icons/SvgIcons';

interface KosManViewProps {
  items: KosItem[];
  wishlist: WishlistItem[];
  budgetPos: BudgetPos[];
  onAddItem: (item: Omit<KosItem, 'id' | 'totalSpend'>) => void;
  onUpdateItem: (id: string, updates: Partial<KosItem>) => void;
  onDeleteItem: (id: string) => void;
  onAddWishlistItem: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'purchased'>) => void;
  onToggleWishlistPurchased: (id: string, alsoLogFinance: boolean) => void;
  onDeleteWishlistItem: (id: string) => void;
  onPullLowStockToWishlist: () => void;
  onQuickPayKosUtility: (item: KosItem) => void;
  onNavigateFinanceSim: () => void;
  onOpenChatGPT: () => void;
  onOpenGoogleSheets: () => void;
}

export const KosManView: React.FC<KosManViewProps> = ({
  items,
  wishlist,
  budgetPos,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddWishlistItem,
  onToggleWishlistPurchased,
  onDeleteWishlistItem,
  onPullLowStockToWishlist,
  onQuickPayKosUtility,
  onNavigateFinanceSim,
  onOpenChatGPT,
  onOpenGoogleSheets,
}) => {
  // Top Section Tab: Inventaris | Wishlist | Pos Kosan
  const [kosSection, setKosSection] = useState<'inventaris' | 'wishlist' | 'poskos'>('inventaris');

  // Filters & Sorting state for Inventaris
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<KosCategory | 'Semua'>('Semua');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Wishlist filters & options
  const [wishlistCatFilter, setWishlistCatFilter] = useState<KosCategory | 'Semua'>('Semua');
  const [wishlistStatusFilter, setWishlistStatusFilter] = useState<'pending' | 'done' | 'all'>('pending');
  const [logFinanceOnBuy, setLogFinanceOnBuy] = useState(true);
  const [copiedWishlist, setCopiedWishlist] = useState(false);

  // Modals & Drawers state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [editingItem, setEditingItem] = useState<KosItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedShoppingList, setCopiedShoppingList] = useState(false);
  const [showShoppingListDrawer, setShowShoppingListDrawer] = useState(false);

  // Form State for Add/Edit KosMan Item (with Multi-Tag)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Bumbu Dapur' as KosCategory,
    tags: ['Bumbu Dapur'] as KosCategory[],
    subCategory: 'Penyedap',
    quantity: 1,
    unit: 'buah',
    price: 10000,
    timesPurchased: 0,
    minThreshold: 1,
    notes: '',
  });

  // Form State for Add Wishlist Item
  const [wishForm, setWishForm] = useState({
    name: '',
    shoppingCategory: 'Bumbu Dapur' as KosCategory,
    subCategory: 'Belanja Mingguan',
    quantity: 1,
    unit: 'buah',
    estimatedPrice: 15000,
    priority: 'Wajib' as WishlistPriority,
    notes: '',
  });

  // Calculate Auto-Recap Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const ok = items.filter(i => i.quantity > i.minThreshold).length;
    const low = items.filter(i => i.quantity > 0 && i.quantity <= i.minThreshold).length;
    const out = items.filter(i => i.quantity === 0).length;
    const pendingWish = wishlist.filter(w => !w.purchased).length;
    const pendingWishTotal = wishlist
      .filter(w => !w.purchased)
      .reduce((acc, w) => acc + w.quantity * w.estimatedPrice, 0);

    return { total, ok, low, out, pendingWish, pendingWishTotal };
  }, [items, wishlist]);

  // Low/Out stock items
  const shoppingListItems = useMemo(() => {
    return items.filter(i => i.quantity <= i.minThreshold);
  }, [items]);

  // Pos Kosan & Listrik items
  const kosUtilityItems = useMemo(() => {
    return items.filter(
      i => i.category === 'Kelistrikan & Kos' || i.tags?.includes('Kelistrikan & Kos')
    );
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

  // Filter & Sort Items (Multi-Tag Aware!)
  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        const matchesCategory =
          selectedCategory === 'Semua' ||
          item.category === selectedCategory ||
          (item.tags && item.tags.includes(selectedCategory));
        const matchesSubCategory = selectedSubCategory === 'Semua' || item.subCategory === selectedSubCategory;
        const tagsJoined = (item.tags || []).join(' ').toLowerCase();
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tagsJoined.includes(searchQuery.toLowerCase()) ||
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

  // Filtered Wishlist
  const filteredWishlist = useMemo(() => {
    return wishlist
      .filter(w => {
        const matchCat = wishlistCatFilter === 'Semua' || w.shoppingCategory === wishlistCatFilter;
        const matchStatus =
          wishlistStatusFilter === 'all' ||
          (wishlistStatusFilter === 'pending' ? !w.purchased : w.purchased);
        return matchCat && matchStatus;
      })
      .sort((a, b) => Number(a.purchased) - Number(b.purchased));
  }, [wishlist, wishlistCatFilter, wishlistStatusFilter]);

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
      tags: ['Bumbu Dapur'],
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
    const currentTags = item.tags && item.tags.length > 0 ? item.tags : [item.category];
    setFormData({
      name: item.name,
      category: item.category,
      tags: Array.from(new Set([item.category, ...currentTags])),
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

  const toggleFormTag = (tag: KosCategory) => {
    if (tag === formData.category) return; // Primary category stays tagged
    setFormData(prev => {
      const exists = prev.tags.includes(tag);
      const nextTags = exists ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag];
      return { ...prev, tags: nextTags };
    });
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const finalTags = Array.from(new Set([formData.category, ...formData.tags]));

    if (editingItem) {
      onUpdateItem(editingItem.id, {
        name: formData.name.trim(),
        category: formData.category,
        tags: finalTags,
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
        tags: finalTags,
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

  const handleSubmitWishlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishForm.name.trim()) return;
    onAddWishlistItem({
      name: wishForm.name.trim(),
      shoppingCategory: wishForm.shoppingCategory,
      subCategory: wishForm.subCategory,
      quantity: Math.max(1, Number(wishForm.quantity)),
      unit: wishForm.unit.trim() || 'buah',
      estimatedPrice: Number(wishForm.estimatedPrice) || 0,
      priority: wishForm.priority,
      source: 'manual',
      notes: wishForm.notes,
    });
    setWishForm({
      name: '',
      shoppingCategory: 'Bumbu Dapur',
      subCategory: 'Belanja Mingguan',
      quantity: 1,
      unit: 'buah',
      estimatedPrice: 15000,
      priority: 'Wajib',
      notes: '',
    });
    setShowWishlistModal(false);
  };

  const handleQuickAddToWishlist = (item: KosItem) => {
    onAddWishlistItem({
      name: item.name,
      shoppingCategory: item.category,
      subCategory: item.subCategory,
      quantity: 1,
      unit: item.unit,
      estimatedPrice: item.price,
      priority: item.quantity === 0 ? 'Wajib' : 'Sedang',
      linkedKosItemId: item.id,
      source: 'manual',
    });
  };

  const handleCopyShoppingList = () => {
    const listText = shoppingListItems
      .map(item => `- ${item.name} (${item.category} · Stok: ${item.quantity} ${item.unit})`)
      .join('\n');
    navigator.clipboard.writeText(`DAFTAR STOK KOSMAN PERLU BELI (${shoppingListItems.length}):\n${listText}`);
    setCopiedShoppingList(true);
    setTimeout(() => setCopiedShoppingList(false), 2000);
  };

  const handleCopyWishlist = () => {
    const pending = wishlist.filter(w => !w.purchased);
    const listText = pending
      .map(w => `- [${w.shoppingCategory}] ${w.name} (${w.quantity} ${w.unit}) ~Rp ${(w.quantity * w.estimatedPrice).toLocaleString('id-ID')}`)
      .join('\n');
    navigator.clipboard.writeText(`WISHLIST & GROCERY LIST KOSMAN (${pending.length} barang):\n${listText}\nEstimasi Total: Rp ${stats.pendingWishTotal.toLocaleString('id-ID')}`);
    setCopiedWishlist(true);
    setTimeout(() => setCopiedWishlist(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2.5 sm:py-5 space-y-2.5 sm:space-y-4 overflow-x-hidden">
      
      {/* Top Sub-Module Switcher + Quick Sync Bar */}
      <div className="bg-white border-2 border-black p-2 rounded-xl comic-shadow flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-[#FFFDF6] border border-black p-0.5 rounded-lg overflow-x-auto max-w-full">
          <button
            onClick={() => setKosSection('inventaris')}
            className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-black whitespace-nowrap transition-all ${
              kosSection === 'inventaris' ? 'bg-[#FFD000] text-black border border-black shadow-[1px_1px_0px_#000]' : 'text-slate-700'
            }`}
          >
            Inventaris Stok ({items.length})
          </button>
          <button
            onClick={() => setKosSection('wishlist')}
            className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-black whitespace-nowrap transition-all flex items-center gap-1 ${
              kosSection === 'wishlist' ? 'bg-[#00E5FF] text-black border border-black shadow-[1px_1px_0px_#000]' : 'text-slate-700'
            }`}
          >
            <span>Wishlist & Grocery</span>
            <span className="bg-[#FF4B82] text-white text-[9px] px-1 rounded-full border border-black tabular-nums">
              {stats.pendingWish}
            </span>
          </button>
          <button
            onClick={() => setKosSection('poskos')}
            className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-black whitespace-nowrap transition-all ${
              kosSection === 'poskos' ? 'bg-[#A3E635] text-black border border-black shadow-[1px_1px_0px_#000]' : 'text-slate-700'
            }`}
          >
            Pos Kosan & Listrik
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenChatGPT}
            className="comic-button bg-[#00E5FF]/20 text-black px-2 py-1 rounded-lg border border-black font-black text-[10px] flex items-center gap-1"
          >
            <IconBot className="w-3 h-3" />
            <span>ChatGPT</span>
          </button>
          <button
            onClick={onOpenGoogleSheets}
            className="comic-button bg-[#A3E635] text-black px-2 py-1 rounded-lg border border-black font-black text-[10px] flex items-center gap-1"
          >
            <IconSheet className="w-3 h-3" />
            <span>Sync Sheets</span>
          </button>
        </div>
      </div>

      {/* Auto Recap Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-[#FFFDF6] border-2 border-black p-2 rounded-xl comic-shadow">
          <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-600 block">Total Katalog</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="font-display font-black text-base sm:text-xl text-black font-mono tabular-nums">{stats.total}</span>
            <span className="text-[9px] font-bold text-slate-500">Item</span>
          </div>
        </div>

        <div className="bg-[#A3E635] border-2 border-black p-2 rounded-xl comic-shadow">
          <span className="text-[9px] sm:text-[10px] font-black uppercase text-black block">Stok Aman</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="font-display font-black text-base sm:text-xl text-black font-mono tabular-nums">{stats.ok}</span>
            <IconCheckCircle className="w-3.5 h-3.5 text-black" />
          </div>
        </div>

        <div className="bg-[#FFD000] border-2 border-black p-2 rounded-xl comic-shadow">
          <span className="text-[9px] sm:text-[10px] font-black uppercase text-black block">Stok Menipis</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="font-display font-black text-base sm:text-xl text-black font-mono tabular-nums">{stats.low}</span>
            <IconAlert className="w-3.5 h-3.5 text-black" />
          </div>
        </div>

        <div className="bg-[#FF4B82] text-white border-2 border-black p-2 rounded-xl comic-shadow">
          <span className="text-[9px] sm:text-[10px] font-black uppercase block">Wishlist Belanja</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="font-display font-black text-base sm:text-xl text-white font-mono tabular-nums">{stats.pendingWish}</span>
            <button
              onClick={() => setKosSection('wishlist')}
              className="text-[9px] font-bold uppercase bg-black text-white px-1.5 py-0.5 rounded"
            >
              Buka List
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 1: INVENTARIS STOK KOSMAN */}
      {/* ============================================================ */}
      {kosSection === 'inventaris' && (
        <div className="space-y-2.5">
          {/* Auto Shopping Recap Banner */}
          {shoppingListItems.length > 0 && (
            <div className="bg-[#FFD000] border-2 border-black p-2.5 rounded-xl comic-shadow space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-black text-[#FFD000] rounded-lg flex items-center justify-center shrink-0">
                    <IconShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xs text-black uppercase">
                      {shoppingListItems.length} BARANG STOK HABIS / MENIPIS
                    </h3>
                    <p className="text-[10px] font-bold text-slate-900">
                      {stats.out} habis total · {stats.low} batas minimum
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => { onPullLowStockToWishlist(); setKosSection('wishlist'); }}
                    className="comic-button bg-[#00E5FF] text-black px-2 py-1 rounded-lg border border-black font-black text-[10px] flex items-center gap-1"
                  >
                    <IconPlus className="w-3 h-3" />
                    <span>Masuk Wishlist</span>
                  </button>
                  <button
                    onClick={handleCopyShoppingList}
                    className="comic-button bg-white text-black px-2 py-1 rounded-lg border border-black font-bold text-[10px] flex items-center gap-1"
                  >
                    {copiedShoppingList ? <IconCheck className="w-3 h-3 text-green-600" /> : <IconCopy className="w-3 h-3" />}
                    <span>{copiedShoppingList ? 'Tersalin' : 'Salin'}</span>
                  </button>
                  <button
                    onClick={() => setShowShoppingListDrawer(!showShoppingListDrawer)}
                    className="comic-button bg-black text-white px-2 py-1 rounded-lg border border-black font-bold text-[10px] flex items-center gap-1"
                  >
                    {showShoppingListDrawer ? <IconChevronUp className="w-3 h-3" /> : <IconChevronDown className="w-3 h-3" />}
                    <span>{showShoppingListDrawer ? 'Tutup' : 'Detail'}</span>
                  </button>
                </div>
              </div>

              {showShoppingListDrawer && (
                <div className="bg-white border border-black p-2 rounded-lg grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
                  {shoppingListItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-50 border border-black px-2 py-1 rounded text-[10px] font-bold">
                      <span className="truncate pr-1 text-black">{item.name}</span>
                      <span className={`px-1 rounded text-[9px] font-mono shrink-0 ${
                        item.quantity === 0 ? 'bg-[#FF4B82] text-white' : 'bg-[#FFD000] text-black'
                      }`}>
                        {item.quantity === 0 ? 'HABIS' : `${item.quantity} ${item.unit}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Control Toolbar */}
          <div className="bg-white border-2 border-black p-2.5 rounded-xl comic-shadow space-y-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="relative flex-1">
                <IconSearch className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari bumbu dapur, nugget, galon, obat, token listrik..."
                  className="w-full pl-8 pr-2.5 py-1.5 bg-[#FFFDF6] border border-black rounded-lg font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="flex items-center bg-[#FFFDF6] border border-black p-0.5 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1 rounded ${viewMode === 'grid' ? 'bg-[#00E5FF] text-black border border-black' : 'text-slate-600'}`}
                    title="Tampilan Grid"
                  >
                    <IconGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1 rounded ${viewMode === 'table' ? 'bg-[#00E5FF] text-black border border-black' : 'text-slate-600'}`}
                    title="Tampilan Tabel"
                  >
                    <IconList className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none bg-[#FFFDF6] border border-black px-2.5 py-1.5 pr-6 rounded-lg font-bold text-[10px] cursor-pointer"
                  >
                    <option value="name-asc">Nama (A - Z)</option>
                    <option value="name-desc">Nama (Z - A)</option>
                    <option value="quantity-asc">Stok Terendah</option>
                    <option value="price-asc">Harga Termurah</option>
                    <option value="price-desc">Harga Tertinggi</option>
                  </select>
                  <IconChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-black" />
                </div>

                <button
                  onClick={handleOpenAdd}
                  className="comic-button bg-[#FF4B82] text-white px-2.5 py-1.5 rounded-lg border border-black font-black text-[10px] flex items-center gap-1 uppercase"
                >
                  <IconPlus className="w-3.5 h-3.5" />
                  <span>Tambah Barang</span>
                </button>
              </div>
            </div>

            {/* Category Filter Strip */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => { setSelectedCategory('Semua'); setSelectedSubCategory('Semua'); }}
                className={`px-2 py-1 rounded-md text-[10px] font-bold whitespace-nowrap border border-black ${
                  selectedCategory === 'Semua' ? 'bg-[#FFD000] text-black shadow-[1px_1px_0px_#000]' : 'bg-[#FFFDF6] text-slate-700'
                }`}
              >
                Semua ({items.length})
              </button>
              {KOS_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => { setSelectedCategory(cat.name); setSelectedSubCategory('Semua'); }}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold whitespace-nowrap border border-black ${
                    selectedCategory === cat.name ? 'bg-[#FFD000] text-black shadow-[1px_1px_0px_#000]' : 'bg-[#FFFDF6] text-slate-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Sub-Category Filter Strip */}
            {availableSubCategories.length > 0 && (
              <div className="flex items-center gap-1 pt-1 border-t border-slate-100 overflow-x-auto scrollbar-none">
                <span className="text-[9px] font-black uppercase text-slate-500 shrink-0">Sub:</span>
                <button
                  onClick={() => setSelectedSubCategory('Semua')}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                    selectedSubCategory === 'Semua' ? 'bg-[#00E5FF] text-black border-black' : 'bg-slate-50 text-slate-600 border-slate-300'
                  }`}
                >
                  Semua
                </button>
                {availableSubCategories.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubCategory(sub)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold whitespace-nowrap border ${
                      selectedSubCategory === sub ? 'bg-[#00E5FF] text-black border-black' : 'bg-slate-50 text-slate-600 border-slate-300'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid / Table Item Display */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-bold text-slate-600 uppercase">
                Menampilkan <span className="font-mono font-black text-black">{filteredItems.length}</span> barang (Multi-Tag Aktif)
              </span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="bg-white border-2 border-black rounded-xl p-6 text-center comic-shadow space-y-2">
                <div className="w-10 h-10 bg-[#FFD000] border border-black rounded-xl flex items-center justify-center mx-auto">
                  <IconSearch className="w-5 h-5 text-black" />
                </div>
                <h3 className="font-display font-black text-sm uppercase text-black">Tidak Ada Barang</h3>
                <p className="text-[11px] font-bold text-slate-600">Coba ubah filter kategori atau kata kunci pencarian.</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {filteredItems.map(item => {
                  const isOut = item.quantity === 0;
                  const isLow = item.quantity > 0 && item.quantity <= item.minThreshold;
                  const extraTags = (item.tags || []).filter(t => t !== item.category);

                  return (
                    <div
                      key={item.id}
                      className={`bg-white border-2 border-black rounded-xl p-2 comic-shadow flex flex-col justify-between space-y-1.5 ${
                        isOut ? 'bg-red-50/40' : isLow ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[8px] font-black uppercase bg-[#FFFDF6] border border-black px-1 py-0.2 rounded truncate max-w-[85px]">
                          {item.category}
                        </span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full border border-black shrink-0 ${
                          isOut ? 'bg-[#FF4B82] text-white' : isLow ? 'bg-[#FFD000] text-black' : 'bg-[#A3E635] text-black'
                        }`}>
                          {isOut ? 'HABIS' : isLow ? 'LOW' : 'AMAN'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-display font-black text-xs text-black leading-tight line-clamp-2">
                          {item.name}
                        </h4>
                        <p className="text-[10px] font-mono font-bold text-slate-700 tabular-nums mt-0.5">
                          Rp {item.price.toLocaleString('id-ID')}
                        </p>
                        {extraTags.length > 0 && (
                          <div className="flex flex-wrap gap-0.5 mt-1">
                            {extraTags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-[8px] font-bold bg-[#00E5FF]/20 border border-black/40 px-1 rounded text-slate-800 truncate max-w-[80px]">
                                +{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        <div className="flex items-center justify-between bg-[#FFFDF6] border border-black p-0.5 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item, -1)}
                            className="w-5 h-5 bg-white hover:bg-slate-100 border border-black rounded font-black text-xs text-black flex items-center justify-center"
                            title="Kurangi Stok"
                          >
                            -
                          </button>
                          <div className="text-center font-mono leading-none">
                            <span className="font-black text-xs text-black block tabular-nums">{item.quantity}</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase">{item.unit}</span>
                          </div>
                          <button
                            onClick={() => handleQuantityChange(item, 1)}
                            className="w-5 h-5 bg-[#00E5FF] hover:bg-cyan-300 border border-black rounded font-black text-xs text-black flex items-center justify-center"
                            title="Tambah Stok"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-1">
                          <button
                            onClick={() => handleQuickAddToWishlist(item)}
                            className="text-[9px] font-black bg-[#FFD000] hover:bg-amber-300 border border-black px-1.5 py-0.5 rounded flex items-center gap-0.5"
                            title="Tambah ke Wishlist Belanja"
                          >
                            <IconShoppingBag className="w-2.5 h-2.5" />
                            <span>+Wish</span>
                          </button>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => handleOpenEdit(item)} className="p-0.5 text-slate-600 hover:text-black" title="Edit">
                              <IconEdit className="w-3 h-3" />
                            </button>
                            <button onClick={() => setDeleteConfirmId(item.id)} className="p-0.5 text-red-500 hover:text-red-700" title="Hapus">
                              <IconTrash className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border-2 border-black rounded-xl comic-shadow overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#FFD000] border-b-2 border-black font-display font-black uppercase text-black text-[10px]">
                    <tr>
                      <th className="p-2">Nama</th>
                      <th className="p-2">Kategori & Multi-Tag</th>
                      <th className="p-2 text-center">Status</th>
                      <th className="p-2 text-center">Stok</th>
                      <th className="p-2 text-right">Harga</th>
                      <th className="p-2 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black font-bold">
                    {filteredItems.map(item => {
                      const isOut = item.quantity === 0;
                      const isLow = item.quantity > 0 && item.quantity <= item.minThreshold;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-2 font-black text-black">{item.name}</td>
                          <td className="p-2">
                            <div className="flex flex-wrap gap-1">
                              {(item.tags && item.tags.length > 0 ? item.tags : [item.category]).map(t => (
                                <span key={t} className="bg-[#FFFDF6] border border-black px-1 rounded text-[9px]">{t}</span>
                              ))}
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black border border-black ${
                              isOut ? 'bg-[#FF4B82] text-white' : isLow ? 'bg-[#FFD000] text-black' : 'bg-[#A3E635] text-black'
                            }`}>
                              {isOut ? 'HABIS' : isLow ? 'LOW' : 'AMAN'}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <div className="inline-flex items-center gap-1 bg-[#FFFDF6] border border-black p-0.5 rounded">
                              <button onClick={() => handleQuantityChange(item, -1)} className="w-4 h-4 bg-white border border-black text-[10px] font-black">-</button>
                              <span className="font-mono px-1 text-[10px] tabular-nums">{item.quantity} {item.unit}</span>
                              <button onClick={() => handleQuantityChange(item, 1)} className="w-4 h-4 bg-[#00E5FF] border border-black text-[10px] font-black">+</button>
                            </div>
                          </td>
                          <td className="p-2 text-right font-mono text-black tabular-nums">
                            Rp {item.price.toLocaleString('id-ID')}
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => handleQuickAddToWishlist(item)} className="px-1.5 py-0.5 bg-[#FFD000] border border-black rounded text-[9px] font-black">+Wish</button>
                              <button onClick={() => handleOpenEdit(item)} className="p-1 text-slate-700"><IconEdit className="w-3 h-3" /></button>
                              <button onClick={() => setDeleteConfirmId(item.id)} className="p-1 text-red-500"><IconTrash className="w-3 h-3" /></button>
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
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 2: WISHLIST & BUYING GROCERIES */}
      {/* ============================================================ */}
      {kosSection === 'wishlist' && (
        <div className="space-y-2.5">
          {/* Wishlist Toolbar */}
          <div className="bg-white border-2 border-black p-2.5 rounded-xl comic-shadow space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display font-black text-xs sm:text-sm uppercase text-black flex items-center gap-1.5">
                  <IconShoppingBag className="w-4 h-4 text-[#FF4B82]" />
                  Wishlist & Buying Groceries ({stats.pendingWish} Aktif)
                </h3>
                <p className="text-[10px] font-bold text-slate-600">
                  Estimasi total belanja: <span className="font-mono font-black text-black tabular-nums">Rp {stats.pendingWishTotal.toLocaleString('id-ID')}</span>
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={onPullLowStockToWishlist}
                  className="comic-button bg-[#FFD000] text-black px-2.5 py-1 rounded-lg border border-black font-black text-[10px] flex items-center gap-1"
                >
                  <IconSparkles className="w-3 h-3" />
                  <span>Tarik Barang Habis/Low</span>
                </button>
                <button
                  onClick={handleCopyWishlist}
                  className="comic-button bg-white text-black px-2 py-1 rounded-lg border border-black font-bold text-[10px] flex items-center gap-1"
                >
                  {copiedWishlist ? <IconCheck className="w-3 h-3 text-green-600" /> : <IconCopy className="w-3 h-3" />}
                  <span>{copiedWishlist ? 'Tersalin' : 'Salin List'}</span>
                </button>
                <button
                  onClick={() => setShowWishlistModal(true)}
                  className="comic-button bg-[#FF4B82] text-white px-2.5 py-1 rounded-lg border border-black font-black text-[10px] flex items-center gap-1 uppercase"
                >
                  <IconPlus className="w-3 h-3" />
                  <span>Tambah Wishlist</span>
                </button>
              </div>
            </div>

            {/* Options & Filter Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-200 text-[10px] font-bold">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={logFinanceOnBuy}
                  onChange={(e) => setLogFinanceOnBuy(e.target.checked)}
                  className="w-3.5 h-3.5 accent-black"
                />
                <span>Otomatis catat pengeluaran ke Keuangan & update stok saat dibeli</span>
              </label>

              <div className="flex items-center gap-1">
                {(['pending', 'done', 'all'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setWishlistStatusFilter(st)}
                    className={`px-2 py-0.5 rounded border border-black ${
                      wishlistStatusFilter === st ? 'bg-black text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {st === 'pending' ? 'Perlu Beli' : st === 'done' ? 'Sudah Dibeli' : 'Semua'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setWishlistCatFilter('Semua')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap border border-black ${
                  wishlistCatFilter === 'Semua' ? 'bg-[#00E5FF] text-black' : 'bg-[#FFFDF6] text-slate-700'
                }`}
              >
                Semua Kategori
              </button>
              {KOS_CATEGORIES.map(c => (
                <button
                  key={c.name}
                  onClick={() => setWishlistCatFilter(c.name)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap border border-black ${
                    wishlistCatFilter === c.name ? 'bg-[#00E5FF] text-black' : 'bg-[#FFFDF6] text-slate-700'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Wishlist Items List */}
          {filteredWishlist.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-400 rounded-xl p-6 text-center space-y-2">
              <div className="w-10 h-10 bg-[#00E5FF]/30 border border-black rounded-xl flex items-center justify-center mx-auto">
                <IconShoppingBag className="w-5 h-5 text-black" />
              </div>
              <h4 className="font-black text-xs text-black uppercase">Daftar Wishlist Belanja Kosong</h4>
              <p className="text-[10px] font-bold text-slate-600">
                Tekan "+ Tambah Wishlist" atau "Tarik Barang Habis/Low" untuk menyiapkan daftar belanjaanmu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredWishlist.map(w => (
                <div
                  key={w.id}
                  className={`border-2 border-black rounded-xl p-2.5 comic-shadow flex flex-col justify-between gap-2 ${
                    w.purchased ? 'bg-slate-100 opacity-75' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 flex-wrap mb-0.5">
                        <span className="text-[8px] font-black uppercase bg-[#FFD000] border border-black px-1 rounded">
                          {w.shoppingCategory}
                        </span>
                        <span className={`text-[8px] font-black uppercase px-1 rounded border border-black ${
                          w.priority === 'Wajib' ? 'bg-[#FF4B82] text-white' : w.priority === 'Sedang' ? 'bg-[#00E5FF] text-black' : 'bg-slate-200 text-black'
                        }`}>
                          {w.priority}
                        </span>
                      </div>
                      <h4 className={`font-display font-black text-xs text-black ${w.purchased ? 'line-through' : ''}`}>
                        {w.name}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-slate-600 tabular-nums">
                        {w.quantity} {w.unit} · Est. Rp {(w.quantity * w.estimatedPrice).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteWishlistItem(w.id)}
                      className="text-slate-400 hover:text-red-600 p-0.5 shrink-0"
                      title="Hapus Wishlist"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Sumber: {w.source}</span>
                    <button
                      onClick={() => onToggleWishlistPurchased(w.id, logFinanceOnBuy)}
                      className={`px-2.5 py-1 rounded-lg border border-black font-black text-[10px] uppercase flex items-center gap-1 ${
                        w.purchased ? 'bg-white text-slate-700' : 'bg-[#A3E635] text-black shadow-[1.5px_1.5px_0px_#000]'
                      }`}
                    >
                      <IconCheck className="w-3 h-3" />
                      <span>{w.purchased ? 'Batal Beli' : 'Sudah Dibeli'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 3: POS KOSAN, KELISTRIKAN & BUDGET MINGGUAN */}
      {/* ============================================================ */}
      {kosSection === 'poskos' && (
        <div className="space-y-2.5">
          <div className="bg-[#A3E635] border-2 border-black p-3 rounded-xl comic-shadow flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-black text-xs sm:text-sm uppercase text-black">
                Pos Kelistrikan, Air & Alokasi Anggaran Kosan
              </h3>
              <p className="text-[10px] font-bold text-slate-900">
                Terpisah dari Alat Tulis agar pengeluaran token listrik, air, gas, dan tabungan mingguan lebih rapi.
              </p>
            </div>
            <button
              onClick={onNavigateFinanceSim}
              className="comic-button bg-black text-[#FFD000] px-3 py-1.5 rounded-lg border border-black font-black text-[10px] uppercase flex items-center gap-1"
            >
              <IconWallet className="w-3.5 h-3.5" />
              <span>Buka Simulasi & Budget Mingguan</span>
            </button>
          </div>

          {/* Weekly Budget Pos Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {budgetPos.map(pos => (
              <div key={pos.id} className="bg-white border-2 border-black p-2.5 rounded-xl comic-shadow space-y-1">
                <div className="flex items-center justify-between">
                  <span className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: pos.color }} />
                  <span className="text-[9px] font-mono font-black bg-slate-100 border border-black px-1 rounded tabular-nums">
                    {pos.allocationPercent}%
                  </span>
                </div>
                <h4 className="font-black text-[11px] text-black leading-tight">{pos.name}</h4>
                <div className="text-xs font-mono font-black text-slate-900 tabular-nums">
                  Rp {pos.weeklyTarget.toLocaleString('id-ID')}/mgg
                </div>
              </div>
            ))}
          </div>

          {/* Utility Items List */}
          <div className="bg-white border-2 border-black p-2.5 rounded-xl comic-shadow space-y-2">
            <h4 className="font-black text-xs uppercase text-black">Item Kelistrikan & Utilitas Kos ({kosUtilityItems.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {kosUtilityItems.map(item => (
                <div key={item.id} className="bg-[#FFFDF6] border border-black p-2.5 rounded-lg flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">{item.subCategory}</span>
                    <h5 className="font-black text-xs text-black truncate">{item.name}</h5>
                    <span className="text-[10px] font-mono font-bold text-slate-700 tabular-nums">
                      Est. Rp {item.price.toLocaleString('id-ID')} · Dibeli {item.timesPurchased}x
                    </span>
                  </div>
                  <button
                    onClick={() => onQuickPayKosUtility(item)}
                    className="comic-button bg-[#FFD000] text-black px-2 py-1 rounded-lg border border-black font-black text-[10px] shrink-0"
                  >
                    Catat Bayar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD / EDIT KOSMAN ITEM (WITH MULTI-TAG) */}
      {/* ============================================================ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2.5">
          <div className="bg-white border-2 border-black rounded-2xl p-3.5 sm:p-4 max-w-md w-full space-y-2.5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="font-display font-black text-sm uppercase text-black">
                {editingItem ? 'EDIT BARANG KOSMAN' : 'TAMBAH BARANG KOSMAN'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="font-bold text-slate-500 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-2.5 text-xs font-bold">
              <div>
                <label className="block text-slate-700 uppercase text-[10px] mb-0.5">Nama Barang *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Nugget Ayam, Mi Goreng, Token Listrik"
                  className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 uppercase text-[10px] mb-0.5">Kategori Utama</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value as KosCategory;
                      const catObj = KOS_CATEGORIES.find(c => c.name === newCat);
                      const nextTags = Array.from(new Set([newCat, ...formData.tags]));
                      setFormData({
                        ...formData,
                        category: newCat,
                        tags: nextTags,
                        subCategory: catObj ? catObj.subCategories[0] : 'Umum'
                      });
                    }}
                    className="w-full px-2 py-1.5 border-2 border-black rounded-lg font-bold bg-white text-xs"
                  >
                    {KOS_CATEGORIES.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 uppercase text-[10px] mb-0.5">Sub-Kategori</label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full px-2 py-1.5 border-2 border-black rounded-lg font-bold bg-white text-xs"
                  >
                    {(KOS_CATEGORIES.find(c => c.name === formData.category)?.subCategories || []).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Tag Selector */}
              <div className="bg-[#FFFDF6] border border-black p-2 rounded-lg space-y-1">
                <label className="block text-[10px] font-black uppercase text-black">
                  Multi-Tag Kategori (Barang bisa masuk lebih dari 1 kategori):
                </label>
                <div className="flex flex-wrap gap-1">
                  {KOS_CATEGORIES.map(c => {
                    const checked = formData.tags.includes(c.name);
                    return (
                      <button
                        type="button"
                        key={c.name}
                        onClick={() => toggleFormTag(c.name)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold border border-black ${
                          checked ? 'bg-[#00E5FF] text-black' : 'bg-white text-slate-600'
                        }`}
                      >
                        {checked ? '✓ ' : '+ '}{c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 uppercase text-[10px] mb-0.5">Stok</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 border-2 border-black rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 uppercase text-[10px] mb-0.5">Satuan</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-2 py-1.5 border-2 border-black rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 uppercase text-[10px] mb-0.5">Harga (IDR)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 border-2 border-black rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 border-2 border-black rounded-lg font-bold text-xs">
                  Batal
                </button>
                <button type="submit" className="comic-button bg-[#FFD000] text-black px-4 py-1.5 border-2 border-black rounded-lg font-black text-xs uppercase">
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD WISHLIST ITEM */}
      {/* ============================================================ */}
      {showWishlistModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2.5">
          <div className="bg-white border-2 border-black rounded-2xl p-3.5 sm:p-4 max-w-sm w-full space-y-2.5">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="font-display font-black text-sm uppercase text-black">TAMBAH WISHLIST BELANJA</h3>
              <button onClick={() => setShowWishlistModal(false)} className="font-bold text-slate-500">✕</button>
            </div>
            <form onSubmit={handleSubmitWishlist} className="space-y-2.5 text-xs font-bold">
              <div>
                <label className="block text-slate-700 uppercase text-[10px] mb-0.5">Nama Barang *</label>
                <input
                  type="text"
                  required
                  value={wishForm.name}
                  onChange={(e) => setWishForm({ ...wishForm, name: e.target.value })}
                  placeholder="Misal: Sabun Cuci Piring, Nugget, Beras..."
                  className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 uppercase text-[10px] mb-0.5">Kategori Belanja</label>
                  <select
                    value={wishForm.shoppingCategory}
                    onChange={(e) => setWishForm({ ...wishForm, shoppingCategory: e.target.value as KosCategory })}
                    className="w-full px-2 py-1.5 border-2 border-black rounded-lg bg-white text-xs font-bold"
                  >
                    {KOS_CATEGORIES.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 uppercase text-[10px] mb-0.5">Prioritas</label>
                  <select
                    value={wishForm.priority}
                    onChange={(e) => setWishForm({ ...wishForm, priority: e.target.value as WishlistPriority })}
                    className="w-full px-2 py-1.5 border-2 border-black rounded-lg bg-white text-xs font-bold"
                  >
                    <option value="Wajib">Wajib</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Keinginan">Keinginan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 uppercase text-[10px] mb-0.5">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={wishForm.quantity}
                    onChange={(e) => setWishForm({ ...wishForm, quantity: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 border-2 border-black rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 uppercase text-[10px] mb-0.5">Satuan</label>
                  <input
                    type="text"
                    value={wishForm.unit}
                    onChange={(e) => setWishForm({ ...wishForm, unit: e.target.value })}
                    className="w-full px-2 py-1.5 border-2 border-black rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 uppercase text-[10px] mb-0.5">Est. Harga</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={wishForm.estimatedPrice}
                    onChange={(e) => setWishForm({ ...wishForm, estimatedPrice: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 border-2 border-black rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => setShowWishlistModal(false)} className="px-3 py-1 border-2 border-black rounded-lg text-xs">
                  Batal
                </button>
                <button type="submit" className="comic-button bg-[#00E5FF] text-black px-4 py-1 border-2 border-black rounded-lg font-black text-xs uppercase">
                  Simpan Wishlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
          <div className="bg-white border-2 border-black rounded-2xl p-4 max-w-sm w-full space-y-3 text-center">
            <h3 className="font-display font-black text-sm uppercase text-black">Hapus Barang Ini?</h3>
            <p className="text-xs font-bold text-slate-600">Barang akan dihapus dari inventaris lokal.</p>
            <div className="flex justify-center gap-2 pt-1">
              <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1 border-2 border-black rounded-lg font-bold text-xs">
                Batal
              </button>
              <button
                onClick={() => { onDeleteItem(deleteConfirmId); setDeleteConfirmId(null); }}
                className="comic-button bg-[#FF4B82] text-white px-4 py-1 border-2 border-black rounded-lg font-black text-xs uppercase"
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
