import { copy, type Copy } from "./copy";
import type { Draft, L, Lang } from "./types";

export function openQuestions(draft: Draft, lang: Lang): string[] {
  const text = copy[lang];
  const items: string[] = [];
  if (!draft.country.trim()) items.push(text.opens.country);
  if (!draft.email.trim() && !draft.whatsapp.trim()) items.push(text.opens.contact);
  if (draft.market === "other") items.push(text.opens.marketOther);
  if (draft.platform === "truck") items.push(text.opens.chassis);
  if (draft.shore === "no" && !draft.generator) items.push(text.opens.shoreNo);
  if (draft.gasOk === "no" && draft.heat !== "electric") items.push(text.opens.gasNo);
  if (draft.menu === "pizza") items.push(text.opens.pizzaOven);
  return items;
}

export function pitchNotes(draft: Draft): L[] {
  const notes: L[] = [];
  if (draft.shore === "no" && !draft.generator) {
    notes.push({
      en: "No shore power and no generator — add a generator, or the truck stays dark.",
      zh: "没有岸电也没有发电机——加上发电机，否则车没有电。",
      ar: "لا كهرباء موقع ولا مولد — أضف مولداً أو تبقى الشاحنة بلا طاقة.",
      es: "Sin corriente en el pitch ni generador — añade generador o el truck no enciende.",
      ru: "Нет берегового питания и нет генератора — добавьте генератор, иначе траки без света.",
    });
  }
  if (draft.shore === "yes" && draft.generator) {
    notes.push({
      en: "Pitch has shore power. A generator is optional backup, not the main feed.",
      zh: "场地有岸电。发电机是备用，不是主供电。",
      ar: "الموقع فيه كهرباء. المولد احتياطي وليس المصدر الرئيسي.",
      es: "El pitch tiene corriente. El generador es respaldo, no la alimentación principal.",
      ru: "На площадке есть береговое питание. Генератор — резерв, не основной ввод.",
    });
  }
  if (draft.gasOk === "no" && draft.heat !== "electric") {
    notes.push({
      en: "LPG is not allowed there. Switch heat to electric, or find a pitch that allows gas.",
      zh: "那里不允许液化气。热源改成纯电，或换允许用气的场地。",
      ar: "LPG غير مسموح. غيّر التسخين إلى كهرباء أو اختر موقعاً يسمح بالغاز.",
      es: "Allí no se permite LPG. Pasa a eléctrico o busca un pitch que permita gas.",
      ru: "LPG там не разрешён. Перейдите на электрику или найдите площадку с газом.",
    });
  }
  if (draft.gasOk === "yes" && draft.heat === "electric") {
    notes.push({
      en: "Pitch allows LPG, but this config is electric-only. That is fine if you want it quiet.",
      zh: "场地允许液化气，但当前配置是纯电。要安静的话没问题。",
      ar: "الموقع يسمح بـ LPG لكن الإعداد كهربائي فقط. مناسب إن أردت هدوءاً.",
      es: "El pitch permite LPG, pero esta config es solo eléctrica. Bien si quieres silencio.",
      ru: "Площадка допускает LPG, но конфигурация только электрическая. Нормально, если нужен тихий режим.",
    });
  }
  return notes;
}

export function moneyLists(text: Copy) {
  return { inside: text.moneyIn, outside: text.moneyOut };
}
