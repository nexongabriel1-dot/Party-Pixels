-- ============================================
-- PartyPixels - Supabase SQL Setup
-- Копирай ЦЕЛИЯ този файл и го пусни в
-- Supabase Dashboard → SQL Editor → New Query
-- ============================================

-- 1. Таблица за продукти
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  badge TEXT,
  badge_class TEXT DEFAULT '',
  rating NUMERIC(3,1),
  review_count INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 5,
  image TEXT,
  colors JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  specs JSONB DEFAULT '[]',
  included JSONB DEFAULT '[]',
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Таблица за колички
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Таблица за артикули в количката
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  color TEXT DEFAULT '',
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Разреши анонимен достъп (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Anyone can create carts" ON carts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read carts" ON carts FOR SELECT USING (true);
CREATE POLICY "Anyone can update carts" ON carts FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete carts" ON carts FOR DELETE USING (true);
CREATE POLICY "Anyone can create cart items" ON cart_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read cart items" ON cart_items FOR SELECT USING (true);
CREATE POLICY "Anyone can update cart items" ON cart_items FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete cart items" ON cart_items FOR DELETE USING (true);

-- 5. Seed данни - 6 продукта
INSERT INTO products (id, name, tagline, description, price, category, badge, badge_class, rating, review_count, stars, image, colors, features, specs, included) VALUES

('lunasync-pro', 'LunaSync Pro', 'Премиум звук, Зашеметяваща светлина',
 'Изживейте премиум звук с впечатляващо атмосферно осветление. LunaSync Pro комбинира висококачествен звук с персонализирано RGB осветление, което реагира на музиката ви – перфектен за съвременни жилищни пространства.',
 149.99, 'premium', 'Premium', '',
 4.8, 124, 5,
 'https://images.unsplash.com/photo-1609223732810-98c8eb4f88ea',
 '[{"name":"Бял","hex":"#ffffff","border":true},{"name":"Черен","hex":"#000000","border":false},{"name":"Сив","hex":"#808080","border":false}]',
 '["360° Bluetooth 5.2","Премиум стерео звук","Тъч контрол","Множество от цветове"]',
 '[{"label":"Свързване","value":"Bluetooth 5.2, Диапазон: 15m"},{"label":"Говорител","value":"Dual 10W говорители, Честота: 50Hz-20kHz"},{"label":"Батерия","value":"Built-in 4000mAh, 12 часов живот на батерията"},{"label":"Осветяване","value":"RGB LED, огромен набор от цветове, Регулируема яркост"},{"label":"Продуктови размери","value":"8\" H x 6\" W"},{"label":"Тегло","value":"600 g"}]',
 '["1x LunaSync Pro лампа","1x USB-C кабел за зареждане","1x Ръководство за потребителя","Едногодишна гаранционна карта"]'),

('vibewave-mini', 'VibeWave Mini', 'Икономична батерия, Силен звук',
 'Компактна и мощна – VibeWave Mini е идеалният спътник за всеки ден. С дълъг живот на батерията и впечатляващ звук, тази малка лампа доказва, че размерът не е всичко.',
 89.99, 'compact', 'Compact', 'badge-compact',
 4.6, 89, 4,
 'https://images.pexels.com/photos/6913319/pexels-photo-6913319.jpeg',
 '[{"name":"Бял","hex":"#ffffff","border":true},{"name":"Зелен","hex":"#98FF98","border":false},{"name":"Розов","hex":"#FFC0CB","border":false}]',
 '["Bluetooth 5.0","Компактен дизайн","Дълъг живот на батерията","Лесно преносима"]',
 '[{"label":"Свързване","value":"Bluetooth 5.0, Диапазон: 10m"},{"label":"Говорител","value":"5W говорител, Честота: 80Hz-18kHz"},{"label":"Батерия","value":"Built-in 2500mAh, 15 часов живот"},{"label":"Осветяване","value":"LED, 16 цвята"},{"label":"Продуктови размери","value":"5\" H x 4\" W"},{"label":"Тегло","value":"350 g"}]',
 '["1x VibeWave Mini лампа","1x USB-C кабел за зареждане","1x Ръководство за потребителя","Едногодишна гаранционна карта"]'),

('neonpulse-rgb', 'NeonPulse RGB', 'Ритъмът оживява чрез светлина',
 'NeonPulse RGB превръща всяка нота в зрелищна светлинна феерия. С пълен RGB спектър и реактивно осветление, тази лампа е мечтата на всеки меломан.',
 129.99, 'rgb', 'RGB', 'badge-rgb',
 4.9, 156, 5,
 'https://images.unsplash.com/photo-1650166689538-cfaa9ad9c68a',
 '[{"name":"Черен","hex":"#000000","border":false},{"name":"Бял","hex":"#ffffff","border":true}]',
 '["Пълен RGB спектър","Реактивно осветление","Bluetooth 5.1","Приложение за контрол"]',
 '[{"label":"Свързване","value":"Bluetooth 5.1, Диапазон: 12m"},{"label":"Говорител","value":"Dual 8W говорители, Честота: 60Hz-20kHz"},{"label":"Батерия","value":"Built-in 3500mAh, 10 часов живот"},{"label":"Осветяване","value":"RGB LED, 16 милиона цвята, Музикален режим"},{"label":"Продуктови размери","value":"7\" H x 5\" W"},{"label":"Тегло","value":"500 g"}]',
 '["1x NeonPulse RGB лампа","1x USB-C кабел за зареждане","1x Ръководство за потребителя","Едногодишна гаранционна карта"]'),

('zenglow-classic', 'ZenGlow Classic', 'Класиката среща иновация',
 'ZenGlow Classic съчетава елегантен ретро дизайн с модерна технология. Перфектна за тези, които ценят класическата естетика, но не искат да се отказват от съвременните удобства.',
 109.99, 'classic', 'Classic', 'badge-classic',
 4.7, 98, 4,
 'https://images.unsplash.com/photo-1609223732842-4ff1cf238726',
 '[{"name":"Кафяв","hex":"#8B4513","border":false},{"name":"Златист","hex":"#DAA520","border":false},{"name":"Бял","hex":"#ffffff","border":true}]',
 '["Ретро дизайн","Топло осветление","Bluetooth 5.0","Дървен корпус"]',
 '[{"label":"Свързване","value":"Bluetooth 5.0, Диапазон: 10m"},{"label":"Говорител","value":"8W говорител, Честота: 70Hz-18kHz"},{"label":"Батерия","value":"Built-in 3000mAh, 12 часов живот"},{"label":"Осветяване","value":"Топъл LED, 8 нюанса"},{"label":"Продуктови размери","value":"9\" H x 5\" W"},{"label":"Тегло","value":"550 g"}]',
 '["1x ZenGlow Classic лампа","1x USB-C кабел за зареждане","1x Ръководство за потребителя","Едногодишна гаранционна карта"]'),

('beatsphere-360', 'BeatSphere 360', 'Около вас – всяка нота',
 'BeatSphere 360 предлага 360-градусов звук и впечатляващо сферично осветление. Създаден за истинските аудиофили, които искат пълно потапяне в музиката.',
 179.99, 'premium', 'Premium', '',
 4.9, 142, 5,
 'https://images.unsplash.com/photo-1760278041388-46b2721e8b8a',
 '[{"name":"Сребърен","hex":"#C0C0C0","border":false},{"name":"Черен","hex":"#000000","border":false},{"name":"Златист","hex":"#FFD700","border":false}]',
 '["360° звук","Сферичен дизайн","Bluetooth 5.2","Hi-Fi аудио"]',
 '[{"label":"Свързване","value":"Bluetooth 5.2, Диапазон: 15m"},{"label":"Говорител","value":"Dual 15W говорители, 360° звук"},{"label":"Батерия","value":"Built-in 5000mAh, 15 часов живот"},{"label":"Осветяване","value":"RGB LED сфера, 360° осветление"},{"label":"Продуктови размери","value":"10\" H x 8\" W"},{"label":"Тегло","value":"800 g"}]',
 '["1x BeatSphere 360 лампа","1x USB-C кабел за зареждане","1x Ръководство за потребителя","Едногодишна гаранционна карта"]'),

('auradesk-pro', 'AuraDesk Pro', 'Помощник за по-ефективен ден',
 'AuraDesk Pro е перфектната настолна лампа за работа и учене. С регулируема яркост, качествен звук и елегантен дизайн, тя превръща всяко бюро в продуктивно пространство.',
 119.99, 'desk', 'Desk', 'badge-desk',
 4.8, 111, 5,
 'https://images.unsplash.com/photo-1761746395513-05aa483cbd2b',
 '[{"name":"Графит","hex":"#708090","border":false},{"name":"Бял","hex":"#ffffff","border":true},{"name":"Черен","hex":"#000000","border":false}]',
 '["Регулируема яркост","Настолен дизайн","Bluetooth 5.0","USB порт за зареждане"]',
 '[{"label":"Свързване","value":"Bluetooth 5.0, Диапазон: 10m"},{"label":"Говорител","value":"6W говорител, Честота: 80Hz-18kHz"},{"label":"Батерия","value":"Built-in 3000mAh, 10 часов живот"},{"label":"Осветяване","value":"LED, 3 режима (топла, неутрална, студена)"},{"label":"Продуктови размери","value":"14\" H x 5\" W"},{"label":"Тегло","value":"700 g"}]',
 '["1x AuraDesk Pro лампа","1x USB-C кабел за зареждане","1x Ръководство за потребителя","Едногодишна гаранционна карта"]')

ON CONFLICT (id) DO NOTHING;
