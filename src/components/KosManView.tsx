import React, { useState, useMemo } from 'react';
import {
  KosItem,
  KosCategory,
  SortOption,
  WishlistItem,
  WishlistPriority,
  BudgetPos,
} from '../types/kosman';
import { KOS_CATEGORIES } from '../data/kosmanItems';
import {
  IconPlus,
  IconSearch,
  IconAlert,
  IconCheckCircle,
  IconShoppingBag,
  IconTrash,
  IconEdit,
  IconCheck,
  IconSheet,
  IconBot,
  IconWallet,
  IconCamera,
  IconChevronDown,
  IconChevronUp,
} from './icons/SvgIcons';
import {
  InlineDropdown,
  InlineConfirmBar,
  InlineNotice,
  InlineScannerPanel,
  OcrExtractedItem,
  ScannedStockItem,
} from './InlineUI';

interface KosManViewProps {
  items: KosItem[];
  wishlist: WishlistItem[];
  budgetPos: BudgetPos[];
  onAddItem: (
    item: Omit<KosItem, 'id' | 'totalSpend'>,
    initialTotalPaid?: number
  ) => void;
  onUpdateItem: (id: string, updates: Partial<KosItem>) => void;
  onRecordItemPurchase: (
    id: string,
    qtyBought: number,
    totalPrice: number,
    account: 'Kas' | 'Bank' | 'E-Wallet',
    note: string
  ) => void;
  onDeleteItem: (id: string) => void;
  onAddWishlistBatch: (
    itemsToAdd: Omit<WishlistItem, 'id' | 'createdAt' | 'purchased'>[]
  ) => void;
  onToggleWishlistPurchased: (id: string, alsoLogFinance: boolean) => void;
  onBulkDeleteWishlist: (ids: string[]) => void;
  onPullLowStockToWishlist: () => number;
  onQuickPayKosUtility: (item: KosItem, totalAmount: number) => void;
  onApplyNotaResult: (payload: {
    storeName: string;
    totalAmount: number;
    date: string;
    time: string;
    category: string;
    note: string;
    items: OcrExtractedItem[];
    alsoUpdateKosMan: boolean;
    account: 'Kas' | 'Bank' | 'E-Wallet';
  }) => void;
  onApplyStockScanResult: (detectedItems: ScannedStockItem[]) => void;
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
  onRecordItemPurchase,
  onDeleteItem,
  onAddWishlistBatch,
  onToggleWishlistPurchased,
  onBulkDeleteWishlist,
  onPullLowStockToWishlist,
  onQuickPayKosUtility,
  onApplyNotaResult,
  onApplyStockScanResult,
  onNavigateFinanceSim,
  onOpenChatGPT,
  onOpenGoogleSheets,
}) => {
  const [kosSection, setKosSection] = useState<'inventaris' | 'wishlist' | 'poskos'>('inventaris');

  // Inline feedback & drawers (Zero pop-up overlays!)
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<KosItem | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<KosCategory | 'Semua'>('Semua');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  // Per-Item Purchase Form State (Qty + Total Overall Price)
  const [purchaseQty, setPurchaseQty] = useState('1');
  const [purchaseTotalPrice, setPurchaseTotalPrice] = useState('');
  const [purchaseAccount, setPurchaseAccount] = useState<'Kas' | 'Bank' | 'E-Wallet'>('Kas');
  const [purchaseNote, setPurchaseNote] = useState('');

  // Quick utility payment price per item
  const [utilityPayAmount, setUtilityPayAmount] = useState<Record<string, string>>({});

  // Master Add / Edit Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Bumbu Dapur' as KosCategory,
    tags: ['Bumbu Dapur'] as KosCategory[],
    subCategory: 'Penyedap',
    quantity: 1,
    unit: 'buah',
    minThreshold: 1,
    initialTotalPaid: '',
    notes: '',
  });

  // Wishlist States (Multi-Add + Bulk Delete!)
  const [showWishBatchForm, setShowWishBatchForm] = useState(false);
  const [wishBatchRows, setWishBatchRows] = useState<
    {
      name: string;
      shoppingCategory: KosCategory;
      subCategory: string;
      quantity: number;
      unit: string;
      estimatedPrice: number;
      priority: WishlistPriority;
    }[]
  >([
    {
      name: '',
      shoppingCategory: 'Bumbu Dapur',
      subCategory: 'Belanja Mingguan',
      quantity: 1,
      unit: 'buah',
      estimatedPrice: 0,
      priority: 'Wajib',
    },
  ]);
  const [wishlistCatFilter, setWishlistCatFilter] = useState<KosCategory | 'Semua'>('Semua');
  const [wishlistStatusFilter, setWishlistStatusFilter] = useState<'pending' | 'done' | 'all'>('pending');
  const [logFinanceOnBuy, setLogFinanceOnBuy] = useState(true);
  const [selectedWishIds, setSelectedWishIds] = useState<string[]>([]);
  const [wishBulkConfirm, setWishBulkConfirm] = useState<'selected' | 'done' | 'all' | null>(null);

  const stats = useMemo(() => {
    const total = items.length;
    const ok = items.filter((i) => i.quantity > i.minThreshold).length;
    const low = items.filter((i) => i.quantity > 0 && i.quantity <= i.minThreshold).length;
    const out = items.filter((i) => i.quantity === 0).length;
    const pendingWish = wishlist.filter((w) => !w.purchased).length;
    const totalHistSpend = items.reduce((acc, i) => acc + (i.totalSpend || 0), 0);
    return { total, ok, low, out, pendingWish, totalHistSpend };
  }, [items, wishlist]);

  const kosUtilityItems = useMemo(() => {
    return items.filter(
      (i) => i.category === 'Kelistrikan & Kos' || i.tags?.includes('Kelistrikan & Kos')
    );
  }, [items]);

  const availableSubCategories = useMemo(() => {
    if (selectedCategory === 'Semua') {
      const allSubs = new Set<string>();
      KOS_CATEGORIES.forEach((c) => c.subCategories.forEach((s) => allSubs.add(s)));
      return Array.from(allSubs);
    }
    const cat = KOS_CATEGORIES.find((c) => c.name === selectedCategory);
    return cat ? cat.subCategories : [];
  }, [selectedCategory]);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesCategory =
          selectedCategory === 'Semua' ||
          item.category === selectedCategory ||
          (item.tags && item.tags.includes(selectedCategory));
        const matchesSubCategory =
          selectedSubCategory === 'Semua' || item.subCategory === selectedSubCategory;
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
          case 'spend-desc':
            return (b.totalSpend || 0) - (a.totalSpend || 0);
          case 'timesPurchased-desc':
            return (b.timesPurchased || 0) - (a.timesPurchased || 0);
          default:
            return 0;
        }
      });
  }, [items, selectedCategory, selectedSubCategory, searchQuery, sortBy]);

  const filteredWishlist = useMemo(() => {
    return wishlist
      .filter((w) => {
        const matchCat = wishlistCatFilter === 'Semua' || w.shoppingCategory === wishlistCatFilter;
        const matchStatus =
          wishlistStatusFilter === 'all' ||
          (wishlistStatusFilter === 'pending' ? !w.purchased : w.purchased);
        return matchCat && matchStatus;
      })
      .sort((a, b) => Number(a.purchased) - Number(b.purchased));
  }, [wishlist, wishlistCatFilter, wishlistStatusFilter]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Bumbu Dapur',
      tags: ['Bumbu Dapur'],
      subCategory: 'Penyedap',
      quantity: 1,
      unit: 'buah',
      minThreshold: 1,
      initialTotalPaid: '',
      notes: '',
    });
    setEditingItem(null);
    setShowAddForm(true);
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
      minThreshold: item.minThreshold,
      initialTotalPaid: '',
      notes: item.notes || '',
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const toggleFormTag = (tag: KosCategory) => {
    if (tag === formData.category) return;
    setFormData((prev) => {
      const exists = prev.tags.includes(tag);
      const nextTags = exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag];
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
        minThreshold: Number(formData.minThreshold),
        notes: formData.notes.trim(),
      });
      setNotice({ type: 'success', text: `Barang "${formData.name.trim()}" diperbarui & disinkronkan.` });
    } else {
      const initialPaid = parseFloat(formData.initialTotalPaid) || 0;
      onAddItem(
        {
          name: formData.name.trim(),
          category: formData.category,
          tags: finalTags,
          subCategory: formData.subCategory,
          quantity: Number(formData.quantity),
          unit: formData.unit.trim() || 'buah',
          price: 0,
          timesPurchased: initialPaid > 0 ? 1 : 0,
          minThreshold: Number(formData.minThreshold),
          notes: formData.notes.trim(),
        },
        initialPaid > 0 ? initialPaid : undefined
      );
      setNotice({ type: 'success', text: `"${formData.name.trim()}" ditambahkan ke KosMan & Google Sheets.` });
    }
    setShowAddForm(false);
    setEditingItem(null);
  };

  const toggleExpandRow = (itemId: string) => {
    if (expandedItemId === itemId) {
      setExpandedItemId(null);
    } else {
      setExpandedItemId(itemId);
      setPurchaseQty('1');
      setPurchaseTotalPrice('');
      setPurchaseNote('');
      setDeleteConfirmId(null);
    }
  };

  const handleSubmitPurchaseForItem = (item: KosItem, e: React.FormEvent) => {
    e.preventDefault();
    const qty = Math.max(1, parseFloat(purchaseQty) || 1);
    const total = Math.max(0, parseFloat(purchaseTotalPrice) || 0);
    onRecordItemPurchase(item.id, qty, total, purchaseAccount, purchaseNote.trim());
    setPurchaseQty('1');
    setPurchaseTotalPrice('');
    setPurchaseNote('');
    setNotice({
      type: 'success',
      text: `Pembelian ${qty} ${item.unit} ${item.name} (Rp ${total.toLocaleString('id-ID')}) dicatat ke Riwayat, Keuangan & Spreadsheet.`,
    });
  };

  const handleBatchWishlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = wishBatchRows.filter((r) => r.name.trim());
    if (validRows.length === 0) return;

    onAddWishlistBatch(
      validRows.map((r) => ({
        name: r.name.trim(),
        shoppingCategory: r.shoppingCategory,
        subCategory: r.subCategory,
        quantity: Math.max(1, Number(r.quantity) || 1),
        unit: r.unit.trim() || 'buah',
        estimatedPrice: Number(r.estimatedPrice) || 0,
        priority: r.priority,
        source: 'manual',
      }))
    );
    setWishBatchRows([
      {
        name: '',
        shoppingCategory: 'Bumbu Dapur',
        subCategory: 'Belanja Mingguan',
        quantity: 1,
        unit: 'buah',
        estimatedPrice: 0,
        priority: 'Wajib',
      },
    ]);
    setShowWishBatchForm(false);
    setNotice({
      type: 'success',
      text: `${validRows.length} item berhasil ditambahkan ke Wishlist sekaligus.`,
    });
  };

  const allVisibleWishSelected =
    filteredWishlist.length > 0 && filteredWishlist.every((w) => selectedWishIds.includes(w.id));

  const toggleSelectAllVisibleWish = () => {
    if (allVisibleWishSelected) {
      const visibleSet = new Set(filteredWishlist.map((w) => w.id));
      setSelectedWishIds((prev) => prev.filter((id) => !visibleSet.has(id)));
    } else {
      const merged = new Set([...selectedWishIds, ...filteredWishlist.map((w) => w.id)]);
      setSelectedWishIds(Array.from(merged));
    }
  };

  const handleExecuteBulkDeleteWishlist = () => {
    let targetIds: string[] = [];
    if (wishBulkConfirm === 'selected') {
      targetIds = selectedWishIds;
    } else if (wishBulkConfirm === 'done') {
      targetIds = wishlist.filter((w) => w.purchased).map((w) => w.id);
    } else if (wishBulkConfirm === 'all') {
      targetIds = wishlist.map((w) => w.id);
    }
    if (targetIds.length > 0) {
      onBulkDeleteWishlist(targetIds);
      setSelectedWishIds([]);
      setNotice({ type: 'info', text: `${targetIds.length} item wishlist dihapus.` });
    }
    setWishBulkConfirm(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2.5 sm:py-4 space-y-3">
      {/* Compact Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white border-2 border-black p-2.5 rounded-xl shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase text-slate-600 block">Total Barang Kos</span>
          <span className="font-mono font-black text-lg text-black tabular-nums">{stats.total}</span>
        </div>
        <div className="bg-[#A3E635] border-2 border-black p-2.5 rounded-xl shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase text-black block">Stok Aman</span>
          <span className="font-mono font-black text-lg text-black tabular-nums">{stats.ok}</span>
        </div>
        <div className="bg-[#FF4B82] text-white border-2 border-black p-2.5 rounded-xl shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase block">Menipis / Habis</span>
          <span className="font-mono font-black text-lg tabular-nums">{stats.low + stats.out}</span>
        </div>
        <div className="bg-[#FFD000] border-2 border-black p-2.5 rounded-xl shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase text-black block">Total Belanja KosMan</span>
          <span className="font-mono font-black text-sm sm:text-base text-black tabular-nums">
            Rp {stats.totalHistSpend.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Top Navigation & Primary Controls */}
      <div className="bg-white border-2 border-black p-2.5 rounded-xl shadow-[2px_2px_0px_#000] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setKosSection('inventaris')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black border border-black whitespace-nowrap ${
              kosSection === 'inventaris' ? 'bg-[#FFD000] text-black' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Tabel Inventaris ({items.length})
          </button>

          <button
            type="button"
            onClick={() => setKosSection('wishlist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black border border-black whitespace-nowrap ${
              kosSection === 'wishlist' ? 'bg-[#FF4B82] text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Wishlist Belanja ({stats.pendingWish})
          </button>

          <button
            type="button"
            onClick={() => setKosSection('poskos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black border border-black whitespace-nowrap ${
              kosSection === 'poskos' ? 'bg-[#00E5FF] text-black' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Pos Kos & Listrik ({kosUtilityItems.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowScanner((v) => !v)}
            className={`comic-button px-2.5 py-1.5 rounded-lg border border-black font-black text-[11px] uppercase flex items-center gap-1 ${
              showScanner ? 'bg-black text-[#00E5FF]' : 'bg-[#00E5FF] text-black'
            }`}
          >
            <IconCamera className="w-3.5 h-3.5" />
            <span>Scan Stok / Nota</span>
          </button>

          <button
            type="button"
            onClick={onOpenChatGPT}
            className="bg-white text-black px-2.5 py-1.5 rounded-lg border border-black font-black text-[11px] uppercase flex items-center gap-1"
          >
            <IconBot className="w-3.5 h-3.5" />
            <span>ChatGPT</span>
          </button>

          <button
            type="button"
            onClick={onOpenGoogleSheets}
            className="bg-[#A3E635] text-black px-2.5 py-1.5 rounded-lg border border-black font-black text-[11px] uppercase flex items-center gap-1"
          >
            <IconSheet className="w-3.5 h-3.5" />
            <span>Set Sheet</span>
          </button>
        </div>
      </div>

      {/* Inline Feedback Banner */}
      {notice && (
        <InlineNotice type={notice.type} message={notice.text} onClose={() => setNotice(null)} />
      )}

      {/* Inline AI Scanner Panel (Scan Nota & Scan Stok) */}
      {showScanner && (
        <InlineScannerPanel
          defaultMode="stok"
          kosItems={items}
          onApplyNotaResult={onApplyNotaResult}
          onApplyStockScanResult={onApplyStockScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* ==================== SECTION 1: TABEL INVENTARIS & RIWAYAT PEMBELIAN ==================== */}
      {kosSection === 'inventaris' && (
        <div className="space-y-3">
          {/* Search + Inline Filter Dropdowns + Add Button */}
          <div className="bg-white border-2 border-black p-3 rounded-xl shadow-[2px_2px_0px_#000] space-y-2.5">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <IconSearch className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama barang, kategori, sub-kategori, atau tag..."
                  className="w-full pl-8 pr-3 py-1.5 border-2 border-black rounded-lg text-xs font-bold bg-[#FFFDF6]"
                />
              </div>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="comic-button bg-[#FF4B82] text-white px-3.5 py-1.5 rounded-lg border border-black font-black text-xs uppercase flex items-center justify-center gap-1 shrink-0"
              >
                <IconPlus className="w-3.5 h-3.5" />
                <span>Tambah Barang</span>
              </button>
            </div>

            {/* Inline Accordion Dropdowns (Mengalir ke bawah, bukan pop-up <select>) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <InlineDropdown
                label="Filter Kategori"
                value={selectedCategory}
                options={['Semua', ...KOS_CATEGORIES.map((c) => c.name)]}
                onChange={(val) => {
                  setSelectedCategory(val as KosCategory | 'Semua');
                  setSelectedSubCategory('Semua');
                }}
              />

              <InlineDropdown
                label="Filter Sub-Kategori"
                value={selectedSubCategory}
                options={['Semua', ...availableSubCategories]}
                onChange={(val) => setSelectedSubCategory(val)}
              />

              <InlineDropdown
                label="Urutkan Tabel"
                value={sortBy}
                options={[
                  { value: 'name-asc', label: 'Nama (A-Z)' },
                  { value: 'name-desc', label: 'Nama (Z-A)' },
                  { value: 'quantity-asc', label: 'Stok Paling Sedikit' },
                  { value: 'spend-desc', label: 'Total Belanja Tertinggi' },
                  { value: 'timesPurchased-desc', label: 'Paling Sering Dibeli' },
                ]}
                onChange={(val) => setSortBy(val as SortOption)}
              />
            </div>
          </div>

          {/* Inline Add / Edit Barang Form (Menyatu ke bawah, bukan pop-up) */}
          {showAddForm && (
            <form
              onSubmit={handleSubmitForm}
              className="bg-[#FFFDF6] border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_#000] space-y-3"
            >
              <div className="flex items-center justify-between border-b border-black pb-1.5">
                <h3 className="font-display font-black text-sm uppercase text-black">
                  {editingItem ? `Edit Barang: ${editingItem.name}` : 'Tambah Barang KosMan Baru'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItem(null);
                  }}
                  className="text-xs font-black px-2 py-0.5 border border-black rounded bg-white"
                >
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
                    Nama Barang *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Nugget Ayam, Galon, Garam, Sabun Mandi..."
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-bold bg-white"
                  />
                </div>

                <InlineDropdown
                  label="Kategori Utama"
                  value={formData.category}
                  options={KOS_CATEGORIES.map((c) => c.name)}
                  onChange={(val) => {
                    const newCat = val as KosCategory;
                    const firstSub =
                      KOS_CATEGORIES.find((c) => c.name === newCat)?.subCategories[0] || 'Umum';
                    setFormData((prev) => ({
                      ...prev,
                      category: newCat,
                      subCategory: firstSub,
                      tags: Array.from(new Set([newCat, ...prev.tags])),
                    }));
                  }}
                />

                <InlineDropdown
                  label="Sub-Kategori"
                  value={formData.subCategory}
                  options={
                    KOS_CATEGORIES.find((c) => c.name === formData.category)?.subCategories || [
                      'Umum',
                    ]
                  }
                  onChange={(val) => setFormData({ ...formData, subCategory: val })}
                />
              </div>

              {/* Multi-Tag Checkboxes */}
              <div>
                <span className="block text-[10px] font-black uppercase text-slate-700 mb-1">
                  Multi-Tag Kategori (Satu barang boleh masuk beberapa kategori):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {KOS_CATEGORIES.map((cat) => {
                    const checked = formData.tags.includes(cat.name) || formData.category === cat.name;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => toggleFormTag(cat.name)}
                        className={`px-2 py-1 rounded border border-black text-[10px] font-black ${
                          checked ? 'bg-[#FFD000] text-black' : 'bg-white text-slate-600'
                        }`}
                      >
                        {checked ? '✓ ' : ''}
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
                    Stok Saat Ini
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-mono font-bold bg-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="bungkus / botol / buah"
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
                    Batas Min Stok
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minThreshold}
                    onChange={(e) =>
                      setFormData({ ...formData, minThreshold: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-mono font-bold bg-white tabular-nums"
                  />
                </div>
                {!editingItem && (
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
                      Total Harga Beli Awal (Opsional)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.initialTotalPaid}
                      onChange={(e) => setFormData({ ...formData, initialTotalPaid: e.target.value })}
                      placeholder="Rp 0"
                      className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-mono font-bold bg-white tabular-nums"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="comic-button bg-[#A3E635] text-black px-4 py-1.5 rounded-lg border border-black font-black text-xs uppercase"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Simpan Barang ke Tabel'}
                </button>
              </div>
            </form>
          )}

          {/* MAIN TABLE UI */}
          {items.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-black rounded-xl p-6 text-center space-y-2.5">
              <IconShoppingBag className="w-9 h-9 text-slate-500 mx-auto" />
              <h3 className="font-display font-black text-sm sm:text-base text-black uppercase">
                Inventaris KosMan Masih Kosong
              </h3>
              <p className="text-xs font-bold text-slate-600 max-w-md mx-auto">
                Tambahkan barang Anda secara manual agar rapi, gunakan Scan Nota/Stok AI, atau tarik data dari Google Spreadsheet.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="comic-button bg-[#FF4B82] text-white px-3.5 py-1.5 rounded-lg border border-black text-xs font-black uppercase"
                >
                  + Tambah Barang Pertama
                </button>
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="comic-button bg-[#00E5FF] text-black px-3.5 py-1.5 rounded-lg border border-black text-xs font-black uppercase"
                >
                  Scan Foto Rak / Nota
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-[3px_3px_0px_#000]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-900 text-white text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Nama Barang</th>
                      <th className="p-2.5">Kategori / Sub</th>
                      <th className="p-2.5 text-center">Stok</th>
                      <th className="p-2.5 text-right hidden sm:table-cell">Total Belanja</th>
                      <th className="p-2.5 hidden md:table-cell">Terakhir Beli</th>
                      <th className="p-2.5 text-right">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredItems.map((item) => {
                      const isExpanded = expandedItemId === item.id;
                      const status =
                        item.quantity === 0
                          ? 'HABIS'
                          : item.quantity <= item.minThreshold
                          ? 'LOW'
                          : 'AMAN';
                      const hist = item.purchaseHistory || [];

                      return (
                        <React.Fragment key={item.id}>
                          <tr
                            onClick={() => toggleExpandRow(item.id)}
                            className={`cursor-pointer transition-colors ${
                              isExpanded ? 'bg-[#FFD000]/25' : 'hover:bg-[#FFFDF6]'
                            }`}
                          >
                            <td className="p-2.5">
                              <div className="font-black text-black text-xs">{item.name}</div>
                              <div className="text-[10px] font-bold text-slate-500">
                                {(item.tags && item.tags.length > 0 ? item.tags : [item.category]).join(' · ')}
                              </div>
                            </td>
                            <td className="p-2.5">
                              <div className="font-bold text-slate-800 text-[11px]">{item.category}</div>
                              <div className="text-[10px] text-slate-500">{item.subCategory}</div>
                            </td>
                            <td className="p-2.5 text-center">
                              <div className="inline-flex items-center gap-1">
                                <span
                                  className={`px-1.5 py-0.5 rounded border border-black font-mono font-black text-[11px] tabular-nums ${
                                    status === 'HABIS'
                                      ? 'bg-[#FF4B82] text-white'
                                      : status === 'LOW'
                                      ? 'bg-[#FFD000] text-black'
                                      : 'bg-[#A3E635] text-black'
                                  }`}
                                >
                                  {item.quantity} {item.unit}
                                </span>
                              </div>
                              <div className="text-[9px] font-black uppercase mt-0.5 text-slate-600">
                                {status}
                              </div>
                            </td>
                            <td className="p-2.5 text-right hidden sm:table-cell font-mono font-black tabular-nums text-black">
                              Rp {(item.totalSpend || 0).toLocaleString('id-ID')}
                              <span className="block text-[9px] font-sans font-bold text-slate-500">
                                {hist.length || item.timesPurchased || 0}x beli
                              </span>
                            </td>
                            <td className="p-2.5 hidden md:table-cell font-mono text-[10px] text-slate-600 tabular-nums">
                              {item.lastPurchasedDate || '-'}
                            </td>
                            <td className="p-2.5 text-right">
                              <span className="inline-flex items-center gap-1 px-2 py-1 border border-black rounded bg-white text-[10px] font-black text-black">
                                <span>{isExpanded ? 'Tutup' : 'Riwayat & Beli'}</span>
                                {isExpanded ? (
                                  <IconChevronUp className="w-3 h-3" />
                                ) : (
                                  <IconChevronDown className="w-3 h-3" />
                                )}
                              </span>
                            </td>
                          </tr>

                          {/* EXPANDED INLINE DETAIL ROW: Per-Item Purchase History + Total Price Buy Form */}
                          {isExpanded && (
                            <tr className="bg-[#FFFDF6]">
                              <td colSpan={6} className="p-3 border-t border-b-2 border-black">
                                <div className="space-y-3">
                                  {/* Quick Stock Controls & Action Buttons */}
                                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-300">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] font-black uppercase text-slate-700">
                                        Sesuaikan Stok:
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          onUpdateItem(item.id, {
                                            quantity: Math.max(0, item.quantity - 1),
                                          })
                                        }
                                        className="w-7 h-7 bg-white border border-black rounded font-black text-sm"
                                      >
                                        -
                                      </button>
                                      <span className="font-mono font-black text-xs px-2 tabular-nums">
                                        {item.quantity} {item.unit}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          onUpdateItem(item.id, { quantity: item.quantity + 1 })
                                        }
                                        className="w-7 h-7 bg-[#A3E635] border border-black rounded font-black text-sm"
                                      >
                                        +
                                      </button>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onAddWishlistBatch([
                                            {
                                              name: item.name,
                                              shoppingCategory: item.category,
                                              subCategory: item.subCategory,
                                              quantity: 1,
                                              unit: item.unit,
                                              estimatedPrice: 0,
                                              priority: item.quantity === 0 ? 'Wajib' : 'Sedang',
                                              linkedKosItemId: item.id,
                                              source: 'manual',
                                            },
                                          ]);
                                          setNotice({
                                            type: 'success',
                                            text: `"${item.name}" ditambahkan ke Wishlist Belanja.`,
                                          });
                                        }}
                                        className="px-2.5 py-1 bg-[#FFD000] border border-black rounded-lg text-[10px] font-black uppercase"
                                      >
                                        + Masuk Wishlist
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleOpenEdit(item)}
                                        className="px-2.5 py-1 bg-white border border-black rounded-lg text-[10px] font-black uppercase flex items-center gap-1"
                                      >
                                        <IconEdit className="w-3 h-3" />
                                        Edit Info
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => setDeleteConfirmId(item.id)}
                                        className="px-2.5 py-1 bg-[#FF4B82] text-white border border-black rounded-lg text-[10px] font-black uppercase flex items-center gap-1"
                                      >
                                        <IconTrash className="w-3 h-3" />
                                        Hapus
                                      </button>
                                    </div>
                                  </div>

                                  {deleteConfirmId === item.id && (
                                    <InlineConfirmBar
                                      title={`Hapus "${item.name}" dari inventaris KosMan?`}
                                      description="Riwayat pembelian pada item ini di KosMan juga akan dihapus."
                                      confirmLabel="Ya, Hapus Barang"
                                      onConfirm={() => {
                                        onDeleteItem(item.id);
                                        setDeleteConfirmId(null);
                                        setExpandedItemId(null);
                                        setNotice({ type: 'info', text: `Barang "${item.name}" dihapus.` });
                                      }}
                                      onCancel={() => setDeleteConfirmId(null)}
                                    />
                                  )}

                                  {/* Form Catat Pembelian Baru (Qty + Total Harga Keseluruhan -> Tanggal & Jam Otomatis) */}
                                  <form
                                    onSubmit={(e) => handleSubmitPurchaseForItem(item, e)}
                                    className="bg-white border-2 border-black rounded-xl p-2.5 space-y-2"
                                  >
                                    <div className="text-[11px] font-black uppercase text-black">
                                      Catat Pembelian Baru (Otomatis Cap Tanggal & Jam + Masuk Keuangan & Sheet)
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                      <div>
                                        <label className="block text-[9px] font-black uppercase text-slate-600">
                                          Qty Beli ({item.unit})
                                        </label>
                                        <input
                                          type="number"
                                          min={1}
                                          required
                                          value={purchaseQty}
                                          onChange={(e) => setPurchaseQty(e.target.value)}
                                          className="w-full px-2 py-1.5 border border-black rounded text-xs font-mono font-bold tabular-nums"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-black uppercase text-slate-600">
                                          Total Harga Keseluruhan (Rp)
                                        </label>
                                        <input
                                          type="number"
                                          min={0}
                                          required
                                          value={purchaseTotalPrice}
                                          onChange={(e) => setPurchaseTotalPrice(e.target.value)}
                                          placeholder="Contoh: 25000"
                                          className="w-full px-2 py-1.5 border border-black rounded text-xs font-mono font-black tabular-nums"
                                        />
                                      </div>
                                      <InlineDropdown
                                        label="Akun"
                                        value={purchaseAccount}
                                        options={['Kas', 'Bank', 'E-Wallet']}
                                        onChange={(val) =>
                                          setPurchaseAccount(val as 'Kas' | 'Bank' | 'E-Wallet')
                                        }
                                      />
                                      <div>
                                        <label className="block text-[9px] font-black uppercase text-slate-600">
                                          Catatan / Toko
                                        </label>
                                        <input
                                          type="text"
                                          value={purchaseNote}
                                          onChange={(e) => setPurchaseNote(e.target.value)}
                                          placeholder="Indomaret / Warung..."
                                          className="w-full px-2 py-1.5 border border-black rounded text-xs font-bold"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex justify-end">
                                      <button
                                        type="submit"
                                        className="comic-button bg-[#A3E635] text-black px-3 py-1.5 rounded-lg border border-black text-[11px] font-black uppercase"
                                      >
                                        Simpan Pembelian & Tambah Stok
                                      </button>
                                    </div>
                                  </form>

                                  {/* Riwayat Transaksi Pembelian Item */}
                                  <div className="bg-white border border-black rounded-xl overflow-hidden">
                                    <div className="bg-slate-100 px-2.5 py-1.5 border-b border-black flex items-center justify-between text-[10px] font-black uppercase">
                                      <span>Riwayat Pembelian "{item.name}" ({hist.length})</span>
                                      <span className="font-mono tabular-nums">
                                        Akumulasi: Rp {(item.totalSpend || 0).toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                    {hist.length === 0 ? (
                                      <div className="p-3 text-[11px] font-bold text-slate-500 text-center">
                                        Belum ada riwayat pembelian tercatat untuk barang ini.
                                      </div>
                                    ) : (
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-[11px]">
                                          <thead className="bg-[#FFFDF6] border-b border-slate-200 text-[9px] uppercase text-slate-600">
                                            <tr>
                                              <th className="p-2">Tanggal & Jam</th>
                                              <th className="p-2 text-right">Qty</th>
                                              <th className="p-2 text-right">Total Harga</th>
                                              <th className="p-2 text-right">Rata-rata / {item.unit}</th>
                                              <th className="p-2">Akun & Catatan</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100 font-mono">
                                            {hist.map((h) => {
                                              const avg = h.quantity > 0 ? Math.round(h.totalPrice / h.quantity) : 0;
                                              return (
                                                <tr key={h.id}>
                                                  <td className="p-2 tabular-nums font-bold text-black">
                                                    {h.purchasedAt}
                                                  </td>
                                                  <td className="p-2 text-right tabular-nums">
                                                    {h.quantity} {item.unit}
                                                  </td>
                                                  <td className="p-2 text-right tabular-nums font-black text-black">
                                                    Rp {h.totalPrice.toLocaleString('id-ID')}
                                                  </td>
                                                  <td className="p-2 text-right tabular-nums text-slate-600">
                                                    Rp {avg.toLocaleString('id-ID')}
                                                  </td>
                                                  <td className="p-2 font-sans font-bold text-slate-700">
                                                    {h.account}
                                                    {h.note ? ` · ${h.note}` : ''}
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
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== SECTION 2: WISHLIST & BUYING GROCERIES (MULTI-ADD + BULK DELETE) ==================== */}
      {kosSection === 'wishlist' && (
        <div className="space-y-3">
          {/* Action Bar */}
          <div className="bg-white border-2 border-black p-3 rounded-xl shadow-[2px_2px_0px_#000] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display font-black text-sm uppercase text-black">
                  Wishlist & Daftar Belanja Kos
                </h3>
                <p className="text-[11px] font-bold text-slate-600">
                  Tambah banyak item sekaligus atau centang beberapa baris untuk hapus massal.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const addedCount = onPullLowStockToWishlist();
                    setNotice({
                      type: addedCount > 0 ? 'success' : 'info',
                      text:
                        addedCount > 0
                          ? `${addedCount} barang stok habis/menipis ditarik ke Wishlist.`
                          : 'Tidak ada barang stok habis/menipis baru untuk ditarik.',
                    });
                  }}
                  className="comic-button bg-[#FFD000] text-black px-2.5 py-1.5 rounded-lg border border-black text-[11px] font-black uppercase"
                >
                  Tarik Barang Habis/Low
                </button>
                <button
                  type="button"
                  onClick={() => setShowWishBatchForm((v) => !v)}
                  className="comic-button bg-[#FF4B82] text-white px-3 py-1.5 rounded-lg border border-black text-[11px] font-black uppercase"
                >
                  + Tambah Banyak Wishlist
                </button>
              </div>
            </div>

            {/* Filters + Auto Finance Checkbox */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <InlineDropdown
                label="Filter Kategori Belanja"
                value={wishlistCatFilter}
                options={['Semua', ...KOS_CATEGORIES.map((c) => c.name)]}
                onChange={(val) => setWishlistCatFilter(val as KosCategory | 'Semua')}
              />
              <InlineDropdown
                label="Status Beli"
                value={wishlistStatusFilter}
                options={[
                  { value: 'pending', label: 'Belum Dibeli' },
                  { value: 'done', label: 'Sudah Dibeli' },
                  { value: 'all', label: 'Semua Status' },
                ]}
                onChange={(val) => setWishlistStatusFilter(val as 'pending' | 'done' | 'all')}
              />
              <label className="flex items-center gap-2 border-2 border-black rounded-lg px-2.5 py-2 bg-[#FFFDF6] text-[11px] font-bold cursor-pointer self-end">
                <input
                  type="checkbox"
                  checked={logFinanceOnBuy}
                  onChange={(e) => setLogFinanceOnBuy(e.target.checked)}
                  className="w-4 h-4 accent-black"
                />
                <span>Otomatis catat ke Keuangan saat dibeli</span>
              </label>
            </div>
          </div>

          {/* Multi-Add Batch Wishlist Form (Inline) */}
          {showWishBatchForm && (
            <form
              onSubmit={handleBatchWishlistSubmit}
              className="bg-[#FFFDF6] border-2 border-black p-3 rounded-xl shadow-[3px_3px_0px_#000] space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-black pb-1.5">
                <span className="font-display font-black text-xs uppercase text-black">
                  Tambah Banyak Barang Wishlist Sekaligus
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setWishBatchRows((prev) => [
                      ...prev,
                      {
                        name: '',
                        shoppingCategory: 'Bumbu Dapur',
                        subCategory: 'Belanja Mingguan',
                        quantity: 1,
                        unit: 'buah',
                        estimatedPrice: 0,
                        priority: 'Sedang',
                      },
                    ])
                  }
                  className="px-2 py-1 bg-[#00E5FF] border border-black rounded text-[10px] font-black uppercase"
                >
                  + Tambah Baris Input
                </button>
              </div>

              <div className="space-y-2">
                {wishBatchRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 bg-white border border-black p-2 rounded-lg items-end"
                  >
                    <div className="sm:col-span-4">
                      <span className="text-[9px] font-black uppercase text-slate-600 block">Nama Barang</span>
                      <input
                        type="text"
                        required
                        value={row.name}
                        onChange={(e) => {
                          const next = [...wishBatchRows];
                          next[idx] = { ...next[idx], name: e.target.value };
                          setWishBatchRows(next);
                        }}
                        placeholder={`Barang #${idx + 1}...`}
                        className="w-full px-2 py-1 border border-black rounded text-xs font-bold"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <InlineDropdown
                        label="Kategori"
                        value={row.shoppingCategory}
                        options={KOS_CATEGORIES.map((c) => c.name)}
                        onChange={(val) => {
                          const next = [...wishBatchRows];
                          next[idx] = { ...next[idx], shoppingCategory: val as KosCategory };
                          setWishBatchRows(next);
                        }}
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <span className="text-[9px] font-black uppercase text-slate-600 block">Qty</span>
                      <input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) => {
                          const next = [...wishBatchRows];
                          next[idx] = { ...next[idx], quantity: Number(e.target.value) || 1 };
                          setWishBatchRows(next);
                        }}
                        className="w-full px-2 py-1 border border-black rounded text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[9px] font-black uppercase text-slate-600 block">Estimasi Total (Rp)</span>
                      <input
                        type="number"
                        min={0}
                        value={row.estimatedPrice}
                        onChange={(e) => {
                          const next = [...wishBatchRows];
                          next[idx] = { ...next[idx], estimatedPrice: Number(e.target.value) || 0 };
                          setWishBatchRows(next);
                        }}
                        className="w-full px-2 py-1 border border-black rounded text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="sm:col-span-2 flex gap-1">
                      <InlineDropdown
                        label="Prioritas"
                        value={row.priority}
                        options={['Wajib', 'Sedang', 'Keinginan']}
                        onChange={(val) => {
                          const next = [...wishBatchRows];
                          next[idx] = { ...next[idx], priority: val as WishlistPriority };
                          setWishBatchRows(next);
                        }}
                      />
                      {wishBatchRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setWishBatchRows(wishBatchRows.filter((_, i) => i !== idx))}
                          className="p-1.5 text-red-600 self-end"
                          title="Hapus baris"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWishBatchForm(false)}
                  className="px-3 py-1.5 bg-white border border-black rounded-lg text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="comic-button bg-[#A3E635] text-black px-3.5 py-1.5 rounded-lg border border-black text-xs font-black uppercase"
                >
                  Simpan {wishBatchRows.filter((r) => r.name.trim()).length} Wishlist
                </button>
              </div>
            </form>
          )}

          {/* Bulk Action Bar */}
          {wishlist.length > 0 && (
            <div className="bg-[#FFFDF6] border-2 border-black p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAllVisibleWish}
                  className="px-2.5 py-1 bg-white border border-black rounded-lg text-[11px] font-black"
                >
                  {allVisibleWishSelected ? 'Batal Pilih Semua' : 'Pilih Semua'}
                </button>
                <span className="text-[11px] font-bold text-slate-600">
                  {selectedWishIds.length} terpilih
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {selectedWishIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setWishBulkConfirm('selected')}
                    className="px-2.5 py-1 bg-[#FF4B82] text-white border border-black rounded-lg text-[11px] font-black uppercase"
                  >
                    Hapus Terpilih ({selectedWishIds.length})
                  </button>
                )}
                {wishlist.some((w) => w.purchased) && (
                  <button
                    type="button"
                    onClick={() => setWishBulkConfirm('done')}
                    className="px-2.5 py-1 bg-white text-black border border-black rounded-lg text-[11px] font-black uppercase"
                  >
                    Hapus Sudah Dibeli
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setWishBulkConfirm('all')}
                  className="px-2.5 py-1 bg-slate-900 text-white border border-black rounded-lg text-[11px] font-black uppercase"
                >
                  Kosongkan Semua
                </button>
              </div>
            </div>
          )}

          {wishBulkConfirm && (
            <InlineConfirmBar
              title={
                wishBulkConfirm === 'selected'
                  ? `Hapus ${selectedWishIds.length} item wishlist yang dicentang?`
                  : wishBulkConfirm === 'done'
                  ? 'Hapus semua wishlist yang sudah selesai dibeli?'
                  : 'Kosongkan seluruh daftar Wishlist?'
              }
              confirmLabel="Ya, Hapus"
              onConfirm={handleExecuteBulkDeleteWishlist}
              onCancel={() => setWishBulkConfirm(null)}
            />
          )}

          {/* Wishlist Table */}
          {filteredWishlist.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-black rounded-xl p-6 text-center text-xs font-bold text-slate-600">
              Belum ada item di Wishlist Belanja untuk filter ini.
            </div>
          ) : (
            <div className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-[3px_3px_0px_#000]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-900 text-white text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5 w-9 text-center">Pilih</th>
                    <th className="p-2.5">Barang</th>
                    <th className="p-2.5 hidden sm:table-cell">Kategori</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Estimasi</th>
                    <th className="p-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredWishlist.map((w) => {
                    const isChecked = selectedWishIds.includes(w.id);
                    return (
                      <tr key={w.id} className={w.purchased ? 'bg-slate-100 opacity-70' : 'bg-white'}>
                        <td className="p-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedWishIds((prev) => [...prev, w.id]);
                              } else {
                                setSelectedWishIds((prev) => prev.filter((id) => id !== w.id));
                              }
                            }}
                            className="w-4 h-4 accent-black"
                          />
                        </td>
                        <td className="p-2.5">
                          <div className={`font-black ${w.purchased ? 'line-through text-slate-500' : 'text-black'}`}>
                            {w.name}
                          </div>
                          <div className="text-[10px] font-bold text-slate-500">
                            {w.priority} · {w.shoppingCategory}
                          </div>
                        </td>
                        <td className="p-2.5 hidden sm:table-cell text-[11px] font-bold text-slate-700">
                          {w.shoppingCategory}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold tabular-nums">
                          {w.quantity} {w.unit}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold tabular-nums">
                          {w.estimatedPrice > 0
                            ? `Rp ${w.estimatedPrice.toLocaleString('id-ID')}`
                            : '-'}
                        </td>
                        <td className="p-2.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onToggleWishlistPurchased(w.id, logFinanceOnBuy)}
                              className={`px-2 py-1 rounded border border-black text-[10px] font-black uppercase ${
                                w.purchased ? 'bg-white text-black' : 'bg-[#A3E635] text-black'
                              }`}
                            >
                              <IconCheck className="w-3 h-3 inline mr-0.5" />
                              {w.purchased ? 'Batal' : 'Sudah Dibeli'}
                            </button>
                            <button
                              type="button"
                              onClick={() => onBulkDeleteWishlist([w.id])}
                              className="p-1 text-slate-400 hover:text-red-600"
                              title="Hapus satu item"
                            >
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
      )}

      {/* ==================== SECTION 3: POS KOSAN & LISTRIK ==================== */}
      {kosSection === 'poskos' && (
        <div className="space-y-3">
          <div className="bg-white border-2 border-black p-3 rounded-xl shadow-[2px_2px_0px_#000] flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-black text-sm uppercase text-black">
                Pos Kelistrikan, Air & Utilitas Kos (Terpisah dari Alat Tulis)
              </h3>
              <p className="text-[11px] font-bold text-slate-600">
                Catat pembayaran tagihan kos/listrik langsung ke Keuangan & Spreadsheet.
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateFinanceSim}
              className="comic-button bg-[#FFD000] text-black px-3 py-1.5 rounded-lg border border-black text-xs font-black uppercase flex items-center gap-1.5"
            >
              <IconWallet className="w-3.5 h-3.5" />
              Atur Rasio Budget Kos
            </button>
          </div>

          {kosUtilityItems.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-black rounded-xl p-6 text-center space-y-2">
              <p className="text-xs font-bold text-slate-600">
                Belum ada item kategori "Kelistrikan & Kos". Tambahkan misalnya Token Listrik PLN atau Iuran Kos.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: 'Token Listrik PLN',
                    category: 'Kelistrikan & Kos',
                    tags: ['Kelistrikan & Kos'],
                    subCategory: 'Listrik & Token PLN',
                    quantity: 1,
                    unit: 'kali',
                    minThreshold: 1,
                    initialTotalPaid: '',
                    notes: '',
                  });
                  setEditingItem(null);
                  setKosSection('inventaris');
                  setShowAddForm(true);
                }}
                className="comic-button bg-[#00E5FF] text-black px-3.5 py-1.5 rounded-lg border border-black text-xs font-black uppercase"
              >
                + Tambah Pos Kelistrikan & Kos
              </button>
            </div>
          ) : (
            <div className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-[3px_3px_0px_#000]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-900 text-white text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Pos Tagihan / Utilitas</th>
                    <th className="p-2.5">Total Terbayar</th>
                    <th className="p-2.5 text-right">Catat Pembayaran Baru (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {kosUtilityItems.map((u) => (
                    <tr key={u.id}>
                      <td className="p-2.5">
                        <div className="font-black text-black">{u.name}</div>
                        <div className="text-[10px] text-slate-500">{u.subCategory}</div>
                      </td>
                      <td className="p-2.5 font-mono font-bold tabular-nums">
                        Rp {(u.totalSpend || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="p-2.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            value={utilityPayAmount[u.id] ?? ''}
                            onChange={(e) =>
                              setUtilityPayAmount({ ...utilityPayAmount, [u.id]: e.target.value })
                            }
                            placeholder="Nominal Rp..."
                            className="w-28 px-2 py-1 border border-black rounded text-xs font-mono tabular-nums"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const amt = parseFloat(utilityPayAmount[u.id] || '0');
                              if (amt <= 0) return;
                              onQuickPayKosUtility(u, amt);
                              setUtilityPayAmount({ ...utilityPayAmount, [u.id]: '' });
                              setNotice({
                                type: 'success',
                                text: `Pembayaran ${u.name} sebesar Rp ${amt.toLocaleString('id-ID')} dicatat ke Keuangan & Sheet.`,
                              });
                            }}
                            className="px-2.5 py-1 bg-[#A3E635] border border-black rounded text-[11px] font-black uppercase"
                          >
                            Bayar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
