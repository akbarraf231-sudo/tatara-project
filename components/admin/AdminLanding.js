'use client';

import { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/ImageUpload';

export function AdminLanding() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => { fetchContent(); }, []);

  async function fetchContent() {
    try {
      const res = await fetch('/api/landing');
      const result = await res.json();
      const data = result.data || {};
      setContent({
        hero_title: data.hero_title || '',
        hero_subtitle: data.hero_subtitle || '',
        hero_image_url: data.hero_image_url || '',
        about_title: data.about_title || '',
        about_text: data.about_text || '',
        about_image_1: data.about_image_1 || '',
        about_image_2: data.about_image_2 || '',
        about_image_3: data.about_image_3 || '',
        about_image_4: data.about_image_4 || '',
        cakes_title: data.cakes_title || '',
        cakes_subtitle: data.cakes_subtitle || '',
        order_title: data.order_title || '',
        contact_title: data.contact_title || '',
        contact_text: data.contact_text || '',
        testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
        ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(content),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error);
      setMessage({ type: 'success', text: 'Landing content tersimpan!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  function update(key, value) {
    setContent({ ...content, [key]: value });
  }


  function addIngredient() {
    update('ingredients', [...content.ingredients, { name: '', image_url: '' }]);
  }
  function removeIngredient(idx) {
    update('ingredients', content.ingredients.filter((_, i) => i !== idx));
  }
  function updateIngredient(idx, key, val) {
    const next = [...content.ingredients];
    next[idx] = { ...next[idx], [key]: val };
    update('ingredients', next);
  }

  if (loading || !content) return <div className="text-[#5a1f2a]">Loading content...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-[#5a1f2a]">📝 Edit Landing Page</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#5a1f2a] hover:bg-[#722f37] disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-full"
        >
          {saving ? 'Menyimpan...' : '💾 Save All'}
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* HERO */}
      <Section title="🏠 Hero Section">
        <Field label="Hero Title">
          <input type="text" value={content.hero_title} onChange={(e) => update('hero_title', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Hero Subtitle">
          <textarea value={content.hero_subtitle} onChange={(e) => update('hero_subtitle', e.target.value)} rows={3} className={inputCls} />
        </Field>
        <ImageUpload label="Hero Image (cake)" value={content.hero_image_url} onChange={(url) => update('hero_image_url', url)} />
      </Section>

      {/* INGREDIENTS */}
      <Section title="🥚 Ingredients (Hero icons)">
        <div className="space-y-3">
          {content.ingredients.map((ing, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end p-3 bg-[#fce8e2] rounded-lg">
              <input type="text" placeholder="Nama (e.g. Eggs)" value={ing.name} onChange={(e) => updateIngredient(i, 'name', e.target.value)} className={inputCls} />
              <div className="flex gap-2 items-center">
                <ImageUpload label="" value={ing.image_url} onChange={(url) => updateIngredient(i, 'image_url', url)} />
                <button onClick={() => removeIngredient(i)} className="bg-red-500 text-white px-3 py-2 rounded-lg font-bold">×</button>
              </div>
            </div>
          ))}
          <button onClick={addIngredient} className="bg-[#5a1f2a] text-white py-2 px-4 rounded-lg font-semibold">+ Add Ingredient</button>
        </div>
      </Section>

      {/* CAKES */}
      <Section title="🍰 Cakes / Gallery Section">
        <Field label="Title"><input type="text" value={content.cakes_title} onChange={(e) => update('cakes_title', e.target.value)} className={inputCls} /></Field>
        <Field label="Subtitle"><input type="text" value={content.cakes_subtitle} onChange={(e) => update('cakes_subtitle', e.target.value)} className={inputCls} /></Field>
      </Section>

      {/* ORDER */}
      <Section title="🛒 Order Section">
        <Field label="Title"><input type="text" value={content.order_title} onChange={(e) => update('order_title', e.target.value)} className={inputCls} /></Field>
      </Section>

      {/* ABOUT */}
      <Section title="ℹ️ About Section">
        <Field label="Title"><input type="text" value={content.about_title} onChange={(e) => update('about_title', e.target.value)} className={inputCls} /></Field>
        <Field label="Text"><textarea value={content.about_text} onChange={(e) => update('about_text', e.target.value)} rows={5} className={inputCls} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <ImageUpload label="Image 1" value={content.about_image_1} onChange={(url) => update('about_image_1', url)} />
          <ImageUpload label="Image 2" value={content.about_image_2} onChange={(url) => update('about_image_2', url)} />
          <ImageUpload label="Image 3" value={content.about_image_3} onChange={(url) => update('about_image_3', url)} />
          <ImageUpload label="Image 4" value={content.about_image_4} onChange={(url) => update('about_image_4', url)} />
        </div>
      </Section>

{/* CONTACT */}
      <Section title="📍 Contact / Visit Us">
        <Field label="Title"><input type="text" value={content.contact_title} onChange={(e) => update('contact_title', e.target.value)} className={inputCls} /></Field>
        <Field label="Text"><textarea value={content.contact_text} onChange={(e) => update('contact_text', e.target.value)} rows={3} className={inputCls} /></Field>
        <p className="text-xs text-[#722f37]">Location link & WhatsApp diatur di tab Settings.</p>
      </Section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-[#5a1f2a] hover:bg-[#722f37] disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg sticky bottom-4 shadow-lg"
      >
        {saving ? 'Menyimpan...' : '💾 Save All Changes'}
      </button>
    </div>
  );
}

const inputCls = 'w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a] focus:outline-none focus:ring-2 focus:ring-[#5a1f2a]';

function Section({ title, children }) {
  return (
    <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-6 space-y-4 shadow-sm">
      <h3 className="text-lg font-bold text-[#5a1f2a]">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#5a1f2a] mb-1">{label}</label>
      {children}
    </div>
  );
}
