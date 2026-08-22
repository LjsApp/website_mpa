import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { WhyUsItem, DEFAULT_WHY_US } from "@/lib/site-types";

export function WhyUsEditor({ value, onChange }: { value: any, onChange: (v: any) => void }) {
  const items: WhyUsItem[] = Array.isArray(value) && value.length > 0 ? value : JSON.parse(JSON.stringify(DEFAULT_WHY_US));
  const [expanded, setExpanded] = useState<string | null>(null);

  const updateItem = (index: number, key: keyof WhyUsItem, val: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: val };
    onChange(newItems);
  };

  const updatePoints = (index: number, val: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], points: val.split('\n').map(p => p.trim()).filter(Boolean) };
    onChange(newItems);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <h3 className="font-display text-xl uppercase mb-2">Mengapa Kami (6 Poin)</h3>
      <p className="text-sm text-muted-foreground mb-4">Poin 04 (Pengiriman Nasional) menggunakan peta otomatis dan tidak memiliki modal.</p>
      
      <div className="space-y-3">
        {items.map((item, idx) => {
          const isExpanded = expanded === item.i;
          const isDelivery = item.i === "04";
          return (
            <div key={item.i} className="border border-border bg-card">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-background/50 transition-colors"
                onClick={() => setExpanded(isExpanded ? null : item.i)}
              >
                <div className="flex items-center gap-4">
                  <div className="text-xl font-display text-primary/50">{item.i}</div>
                  <div className="font-semibold">{item.t}</div>
                </div>
                <div className="text-muted-foreground">
                  {isExpanded ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  )}
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-border space-y-4 mt-4">
                  <div className="space-y-1 mt-4">
                    <Label>Judul Singkat</Label>
                    <Input value={item.t} onChange={(e) => updateItem(idx, 't', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Deskripsi Pendek (di Card)</Label>
                    <Textarea rows={2} value={item.d} onChange={(e) => updateItem(idx, 'd', e.target.value)} />
                  </div>
                  
                  {!isDelivery && (
                    <>
                      <div className="pt-4 border-t border-border/50">
                        <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider text-primary">Konten Modal (Saat Card Diklik)</h4>
                        
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <Label>Tagline Modal</Label>
                            <Input value={item.tagline || ""} onChange={(e) => updateItem(idx, 'tagline', e.target.value)} />
                          </div>
                          
                          <div className="space-y-1">
                            <Label>Poin-poin Detail (1 baris = 1 poin)</Label>
                            <Textarea 
                              rows={5} 
                              value={(item.points || []).join('\n')} 
                              onChange={(e) => updatePoints(idx, e.target.value)}
                              placeholder="Ketik poin pertama di sini...\nTekan enter untuk poin kedua..."
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label>Label Tombol CTA</Label>
                              <Input value={item.cta_label || ""} onChange={(e) => updateItem(idx, 'cta_label', e.target.value)} placeholder="Contoh: Hubungi Kami" />
                            </div>
                            <div className="space-y-1">
                              <Label>Target URL / ID Section</Label>
                              <Input value={item.cta_target || ""} onChange={(e) => updateItem(idx, 'cta_target', e.target.value)} placeholder="Contoh: #contact atau /kontak" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
