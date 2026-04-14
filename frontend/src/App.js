import { useEffect, useState, createContext, useContext, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useParams, useLocation } from "react-router-dom";
import { supabase } from "./supabaseClient";

// Cart Context
const CartContext = createContext();

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(() => localStorage.getItem("pp_cart_id"));

  const fetchCart = useCallback(async (id) => {
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, products(*)")
        .eq("cart_id", id);
      if (error) throw error;
      setCartItems(data || []);
    } catch {
      localStorage.removeItem("pp_cart_id");
      setCartId(null);
      setCartItems([]);
    }
  }, []);

  const ensureCart = useCallback(async () => {
    if (cartId) {
      // Verify cart exists
      const { data } = await supabase.from("carts").select("id").eq("id", cartId).single();
      if (data) return cartId;
    }
    const { data, error } = await supabase.from("carts").insert({}).select("id").single();
    if (error) throw error;
    localStorage.setItem("pp_cart_id", data.id);
    setCartId(data.id);
    return data.id;
  }, [cartId]);

  useEffect(() => {
    if (cartId) fetchCart(cartId);
  }, [cartId, fetchCart]);

  const addToCart = async (productId, color, quantity = 1) => {
    const cid = await ensureCart();
    // Check if item already in cart
    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cid)
      .eq("product_id", productId)
      .eq("color", color)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        cart_id: cid,
        product_id: productId,
        color,
        quantity,
      });
    }
    await fetchCart(cid);
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!cartId) return;
    if (quantity <= 0) {
      await supabase.from("cart_items").delete().eq("id", itemId);
    } else {
      await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
    }
    await fetchCart(cartId);
  };

  const removeItem = async (itemId) => {
    if (!cartId) return;
    await supabase.from("cart_items").delete().eq("id", itemId);
    await fetchCart(cartId);
  };

  const clearCart = async () => {
    if (!cartId) return;
    await supabase.from("cart_items").delete().eq("cart_id", cartId);
    await fetchCart(cartId);
  };

  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, itemCount, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  return useContext(CartContext);
}

// ScrollToTop
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Navbar
function Navbar() {
  const { itemCount } = useCart();
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo" data-testid="logo-link">
          <div className="logo-icon"><img src="/logo.png" alt="PartyPixels" /></div>
          <span>PartyPixels</span>
        </Link>
        <ul className="nav-menu">
          <li><Link to="/" className={path === "/" ? "active" : ""} data-testid="nav-home">Home</Link></li>
          <li><Link to="/products" className={path === "/products" ? "active" : ""} data-testid="nav-products">Products</Link></li>
          <li><Link to="/contact" className={path === "/contact" ? "active" : ""} data-testid="nav-contact">Contact</Link></li>
          <li>
            <Link to="/cart" className={`cart-link ${path === "/cart" ? "active" : ""}`} data-testid="nav-cart">
              <span className="cart-icon">&#128722;</span>
              <span className="cart-count" data-testid="cart-count">{itemCount}</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

// Footer
function Footer() {
  return (
    <footer className="footer" data-testid="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <div className="logo-icon"><img src="/logo-footer.png" alt="PartyPixels" /></div>
              <span>PartyPixels</span>
            </div>
            <p className="footer-description">Превърнете дома си с първокласен звук и светлина – където дизайнът среща иновацията.</p>
            <div className="social-links">
              <a href="#!" className="social-link">&#128216;</a>
              <a href="#!" className="social-link">&#128038;</a>
              <a href="#!" className="social-link">&#128247;</a>
              <a href="#!" className="social-link">&#9654;&#65039;</a>
            </div>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Продукти</h4>
            <ul className="footer-links">
              <li><Link to="/products">Всички продукти</Link></li>
              <li><Link to="/products">Premium колекция</Link></li>
              <li><Link to="/products">Compact серия</Link></li>
              <li><Link to="/products">БестСелърс</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Помощ</h4>
            <ul className="footer-links">
              <li><Link to="/contact">Свържи се с нас</Link></li>
              <li><a href="#!">Често задавани въпроси</a></li>
              <li><a href="#!">Доставка и връщане</a></li>
              <li><a href="#!">Гаранция</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Бъди информиран</h4>
            <p className="newsletter-text">Абонирай се и получавай известия и ексклузивни отстъпки.</p>
            <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert("Благодарим ти!"); }}>
              <input type="email" placeholder="Въведи имейла си тук" className="newsletter-input" required data-testid="newsletter-input" />
              <button type="submit" className="btn btn-primary" data-testid="newsletter-submit">Абонирай се</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 PartyPixels. Всички права запазени.</p>
          <div className="footer-bottom-links">
            <a href="#!">Поверителност</a>
            <a href="#!">Условия</a>
            <a href="#!">Бисквитки</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Star renderer
function Stars({ count }) {
  return <span className="stars">{"★".repeat(count)}{"☆".repeat(5 - count)}</span>;
}

// Product Card
function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product.id, product.colors[0]?.name || "", 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-card animate-on-scroll" data-testid={`product-card-${product.id}`}>
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        <span className={`product-badge ${product.badge_class}`}>{product.badge}</span>
        <button className={`add-to-cart-btn ${added ? "added" : ""}`} onClick={handleAdd} data-testid={`add-to-cart-${product.id}`}>
          {added ? "Добавено ✓" : "Добави в количка"}
        </button>
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-tagline">{product.tagline}</p>
        <div className="product-rating">
          <Stars count={product.stars} />
          <span className="rating-text">{product.rating} ({product.review_count})</span>
        </div>
        <div className="product-colors">
          {product.colors.map((c, i) => (
            <span key={i} className="color-dot" style={{ background: c.hex, border: c.border ? "1px solid #ddd" : "none" }} />
          ))}
        </div>
        <div className="product-footer">
          <span className="product-price">{product.price}€</span>
          <Link to={`/products/${product.id}`} className="btn btn-small" data-testid={`view-product-${product.id}`}>Виж повече</Link>
        </div>
      </div>
    </div>
  );
}

// HOME PAGE
function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("products").select("*").limit(3);
      setProducts(data || []);
    }
    load();
  }, []);

  return (
    <>
      <section className="hero parallax-section" data-testid="hero-section">
        <div className="parallax-bg"></div>
        <div className="container hero-content">
          <div className="hero-text animate-fade-in-up">
            <div className="badge">&#10024; Ново поколение музикални лампи</div>
            <h1 className="hero-title">Освети своите<br /><span className="gradient-text">Любими ритми</span></h1>
            <p className="hero-description">Наслади се на микс от висококачествен звук и модерно осветление. Свържи се безконтактно чрез Bluetooth и превърни всяко място в лично парти преживяване.</p>
            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary" data-testid="hero-shop-btn">Пазарувай сега!</Link>
              <Link to="/contact" className="btn btn-outline" data-testid="hero-learn-btn">Научи повече</Link>
            </div>
            <div className="hero-stats">
              <div className="stat"><p className="stat-number">15h</p><p className="stat-label">Живот на батерията</p></div>
              <div className="stat"><p className="stat-number">5.2</p><p className="stat-label">Bluetooth</p></div>
              <div className="stat"><p className="stat-number">100+</p><p className="stat-label">Цветове</p></div>
            </div>
          </div>
          <div className="hero-image animate-fade-in">
            <img src="https://images.unsplash.com/photo-1609223732810-98c8eb4f88ea" alt="PartyPixels Lamp" />
            <div className="price-badge">
              <p className="price-label">Цените започват от:</p>
              <p className="price-value">89.99€</p>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" data-testid="features-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2 className="section-title">Защо PartyPixels ?</h2>
            <p className="section-description">Иновативната технология се среща с класическия дизайн. Всяка лампа е проектирана за перфектно аудио-визуално преживяване.</p>
          </div>
          <div className="features-grid">
            {[
              { icon: "&#128225;", title: "Свобода на свързване", text: "Напредналата Bluetooth 5.0+ технология предпоставя стабилна връзка с диапазон до 15 м. Без кабели и без затруднения." },
              { icon: "&#127925;", title: "Премиум звук", text: "Високочестотните говорители доставят кристалночисто аудио. Изживей музикалното приключение, както никога до сега!" },
              { icon: "&#127912;", title: "Безброй цветове", text: "Персонализирай преживяването си с множеството от цветове. Избери цвета според твоето настроение." },
              { icon: "&#128267;", title: "Дълъг живот на батерията", text: "Какво ще кажеш за над 15 часа нон-стоп парти? Зареди един път, забавлявай се до сутринта!" },
              { icon: "&#127968;", title: "Бъди смарт", text: "Продуктите работят с Alexa, Google Home и много други." },
            ].map((f, i) => (
              <div key={i} className="feature-card animate-on-scroll" style={{ animationDelay: `${(i + 1) * 0.1}s` }}>
                <div className="feature-icon" dangerouslySetInnerHTML={{ __html: f.icon }} />
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-text">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="products-section" data-testid="bestsellers-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2 className="section-title">BestSellers</h2>
            <p className="section-description">Разгледай най-популярните ни музикални лампи, обичани от десетки хиляди клиенти от целия свят.</p>
          </div>
          <div className="products-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="section-cta">
            <Link to="/products" className="btn btn-primary" data-testid="view-all-products-btn">Виж всички продукти</Link>
          </div>
        </div>
      </section>

      <section className="testimonials-section parallax-section" data-testid="testimonials-section">
        <div className="parallax-bg-2"></div>
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2 className="section-title text-white">Какво казват нашите клиенти</h2>
            <p className="section-description text-white-muted">Хиляди вече преобразиха своето пространство – време е и ти да го направиш.</p>
          </div>
          <div className="testimonials-grid">
            {[
              { text: "LunaSync Pro преобрази хола ми – звукът е невероятен, а осветлението създава перфектната атмосфера за всеки момент.", initials: "SM", name: "Иван Иванов", role: "Интериорен дизайнер" },
              { text: "Като човек, който работи със звук всеки ден, съм впечатлен от кристалната яснота и красивите светлини – NeonPulse RGB вече е незаменима част от студиото ми.", initials: "DC", name: "Мартин Петров", role: "Музикален продуцент" },
              { text: "Късните учебни сесии вече са по-лесни с AuraDesk Pro – вдъхновяваща светлина и качествен звук.", initials: "ER", name: "Мария Христова", role: "Студент" },
            ].map((t, i) => (
              <div key={i} className="testimonial-card animate-on-scroll" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.initials}</div>
                  <div><p className="author-name">{t.name}</p><p className="author-role">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section" data-testid="cta-section">
        <div className="container cta-content">
          <h2 className="cta-title animate-on-scroll">Готов ли си да разнообразиш ежедневието си?</h2>
          <p className="cta-text animate-on-scroll">Превърни всяка нота в реалност. Само сега! Безплатна доставка на всички поръчки над 100€.</p>
          <Link to="/products" className="btn btn-primary btn-large animate-on-scroll" data-testid="cta-order-btn">Поръчай сега</Link>
        </div>
      </section>
    </>
  );
}

// PRODUCTS PAGE
function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");

  useEffect(() => {
    async function load() {
      let query = supabase.from("products").select("*");
      if (category !== "all") query = query.eq("category", category);
      if (priceRange === "under100") query = query.lt("price", 100);
      if (priceRange === "100-150") query = query.gte("price", 100).lte("price", 150);
      if (priceRange === "over150") query = query.gt("price", 150);
      const { data } = await query;
      setProducts(data || []);
    }
    load();
  }, [category, priceRange]);

  const categories = [
    { value: "all", label: "Всички" }, { value: "premium", label: "Premium" },
    { value: "compact", label: "Compact" }, { value: "rgb", label: "RGB" },
    { value: "classic", label: "Класически" }, { value: "desk", label: "Настолни лампи" },
  ];
  const prices = [
    { value: "all", label: "Всички" }, { value: "under100", label: "Под 100€" },
    { value: "100-150", label: "100€-150€" }, { value: "over150", label: "Над 150€" },
  ];

  return (
    <>
      <section className="page-header" data-testid="products-page-header">
        <div className="container">
          <h1 className="page-title animate-fade-in-up">Нашата колекция</h1>
          <p className="page-description animate-fade-in-up">Открийте пълната ни гама музикални лампи – всяка създадена за изключителен звук и впечатляващи визуални ефекти.</p>
        </div>
      </section>
      <section className="filter-section" data-testid="filter-section">
        <div className="container">
          <div className="filter-card">
            <h3 className="filter-title">&#127899;&#65039; Филтри</h3>
            <div className="filter-groups">
              <div className="filter-group">
                <label className="filter-label">Категория</label>
                <div className="filter-options">
                  {categories.map(c => (
                    <button key={c.value} className={`filter-btn ${category === c.value ? "filter-active" : ""}`} onClick={() => setCategory(c.value)} data-testid={`filter-cat-${c.value}`}>{c.label}</button>
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <label className="filter-label">Ценови диапазон</label>
                <div className="filter-options">
                  {prices.map(p => (
                    <button key={p.value} className={`filter-btn ${priceRange === p.value ? "filter-active" : ""}`} onClick={() => setPriceRange(p.value)} data-testid={`filter-price-${p.value}`}>{p.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="products-listing" data-testid="products-listing">
        <div className="container">
          <p className="results-count">Пред Вас са <strong>{products.length} продукта</strong></p>
          <div className="products-grid">
            {products.map((p, i) => (
              <div key={p.id} style={{ animationDelay: `${i * 0.1}s` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// PRODUCT DETAIL PAGE
function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("specs");
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("products").select("*").eq("id", id).single();
      if (data) {
        setProduct(data);
        setSelectedColor(data.colors[0]?.name || "");
      }
    }
    load();
  }, [id]);

  if (!product) return <div style={{ paddingTop: 120, textAlign: "center" }}>Зареждане...</div>;

  const handleAddToCart = async () => {
    await addToCart(product.id, selectedColor, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section className="product-detail-section" data-testid="product-detail-section">
      <div className="container">
        <Link to="/products" className="back-link" data-testid="back-to-products">&#8592; Назад към Продукти</Link>
        <div className="product-detail-grid">
          <div className="product-detail-image animate-on-scroll">
            <img src={product.image} alt={product.name} />
            <span className={`product-badge ${product.badge_class}`}>{product.badge}</span>
          </div>
          <div className="product-detail-info animate-on-scroll" style={{ animationDelay: "0.2s" }}>
            <h1 className="product-detail-title" data-testid="product-detail-name">{product.name}</h1>
            <p className="product-detail-tagline">{product.tagline}</p>
            <div className="product-rating">
              <Stars count={product.stars} />
              <span className="rating-text">{product.rating} ({product.review_count} reviews)</span>
            </div>
            <div className="product-price-large" data-testid="product-detail-price">{product.price}€</div>
            <div className="product-description"><p>{product.description}</p></div>
            <div className="color-selection">
              <label className="selection-label">Избери цвят: <strong>{selectedColor}</strong></label>
              <div className="color-options">
                {product.colors.map((c, i) => (
                  <button key={i} className={`color-option ${selectedColor === c.name ? "color-selected" : ""}`} style={{ background: c.hex, border: c.border ? "2px solid #ddd" : "3px solid transparent" }} onClick={() => setSelectedColor(c.name)} data-testid={`color-option-${i}`} />
                ))}
              </div>
            </div>
            <div className="quantity-selection">
              <label className="selection-label">Количество</label>
              <div className="quantity-selector-large">
                <button className="qty-btn-large" onClick={() => setQuantity(Math.max(1, quantity - 1))} data-testid="qty-decrease">&#8722;</button>
                <span className="qty-value-large" data-testid="qty-value">{quantity}</span>
                <button className="qty-btn-large" onClick={() => setQuantity(quantity + 1)} data-testid="qty-increase">+</button>
              </div>
              <span className="stock-status">&#9989; В наличност</span>
            </div>
            <div className="product-actions">
              <button className={`btn btn-primary btn-large ${added ? "btn-success" : ""}`} onClick={handleAddToCart} data-testid="add-to-cart-detail">
                {added ? "&#9989; Добавено!" : "&#128722; Добави в количка"}
              </button>
            </div>
            <div className="features-list">
              {product.features.map((f, i) => <div key={i} className="feature-item">&#9989; {f}</div>)}
            </div>
            <div className="product-trust-badges">
              <div className="trust-badge"><span className="badge-icon">&#128666;</span><span className="badge-text">Безплатна доставка</span></div>
              <div className="trust-badge"><span className="badge-icon">&#128737;&#65039;</span><span className="badge-text">1 година гаранция</span></div>
              <div className="trust-badge"><span className="badge-icon">&#128260;</span><span className="badge-text">30 дни право на връщане</span></div>
            </div>
          </div>
        </div>
        <div className="product-tabs" data-testid="product-tabs">
          <div className="tabs-header">
            <button className={`tab-label ${activeTab === "specs" ? "tab-active" : ""}`} onClick={() => setActiveTab("specs")} data-testid="tab-specs">Повече детайли</button>
            <button className={`tab-label ${activeTab === "included" ? "tab-active" : ""}`} onClick={() => setActiveTab("included")} data-testid="tab-included">Какво е включено в комплекта?</button>
          </div>
          <div className="tabs-content">
            {activeTab === "specs" && (
              <div className="tab-panel animate-fade-in-up">
                <h3>Технически спецификации</h3>
                <div className="specs-grid">
                  {product.specs.map((s, i) => (
                    <div key={i} className="spec-item"><span className="spec-label">{s.label}</span><span className="spec-value">{s.value}</span></div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "included" && (
              <div className="tab-panel animate-fade-in-up">
                <h3>Пакетът включва</h3>
                <ul className="included-list">
                  {product.included.map((item, i) => <li key={i}>&#9989; {item}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// CART PAGE
function CartPage() {
  const { cartItems, updateQuantity, removeItem, clearCart, itemCount } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const subtotal = cartItems.reduce((sum, i) => sum + (i.products?.price || 0) * i.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <>
      <section className="page-header" data-testid="cart-page-header">
        <div className="container">
          <h1 className="page-title animate-fade-in-up">Твоята количка</h1>
          <p className="page-description animate-fade-in-up">Всичко готово? Прегледайте и завършете покупката си с едно кликване</p>
        </div>
      </section>
      <section className="cart-section" data-testid="cart-section">
        <div className="container">
          {cartItems.length === 0 ? (
            <div className="cart-empty" data-testid="cart-empty">
              <h2>Количката е празна</h2>
              <p>Добави продукти, за да продължиш.</p>
              <Link to="/products" className="btn btn-primary" data-testid="continue-shopping-empty">Пазарувай сега</Link>
            </div>
          ) : (
            <div className="cart-grid">
              <div className="cart-items animate-on-scroll" data-testid="cart-items">
                <h2 className="cart-heading">Твоите продукти ({itemCount})</h2>
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item" data-testid={`cart-item-${item.product_id}`}>
                    <img src={item.products?.image} alt={item.products?.name} className="cart-item-image" />
                    <div className="cart-item-info">
                      <h3 className="cart-item-name">{item.products?.name}</h3>
                      <p className="cart-item-color">Цвят: {item.color}</p>
                      <p className="cart-item-price">{item.products?.price}€</p>
                    </div>
                    <div className="cart-item-quantity">
                      <label className="quantity-label">Количество:</label>
                      <div className="quantity-selector">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)} data-testid={`cart-qty-decrease-${item.product_id}`}>&#8722;</button>
                        <span className="qty-value" data-testid={`cart-qty-value-${item.product_id}`}>{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)} data-testid={`cart-qty-increase-${item.product_id}`}>+</button>
                      </div>
                    </div>
                    <div className="cart-item-total">
                      <p className="item-total-price" data-testid={`cart-item-total-${item.product_id}`}>{((item.products?.price || 0) * item.quantity).toFixed(2)}€</p>
                      <button className="remove-btn" onClick={() => removeItem(item.id)} data-testid={`cart-remove-${item.product_id}`}>&#128465;&#65039;</button>
                    </div>
                  </div>
                ))}
                <div className="cart-actions">
                  <Link to="/products" className="btn btn-outline" data-testid="continue-shopping-btn">&#8592; Продължи с пазаруването</Link>
                  <button className="btn btn-text" onClick={clearCart} data-testid="clear-cart-btn">Изчисти кошницата</button>
                </div>
              </div>
              <div className="order-summary animate-on-scroll" style={{ animationDelay: "0.2s" }} data-testid="order-summary">
                <h2 className="summary-heading">Обобщение</h2>
                <div className="summary-row"><span className="summary-label">Междинна сума:</span><span className="summary-value" data-testid="summary-subtotal">{subtotal.toFixed(2)}€</span></div>
                <div className="summary-row"><span className="summary-label">Доставка:</span><span className={`summary-value ${shipping === 0 ? "free" : ""}`} data-testid="summary-shipping">{shipping === 0 ? "БЕЗПЛАТНА" : `${shipping.toFixed(2)}€`}</span></div>
                <div className="summary-row"><span className="summary-label">Други такси:</span><span className="summary-value">0.00€</span></div>
                <div className="summary-divider"></div>
                <div className="summary-row total"><span className="summary-label">Общо:</span><span className="summary-value" data-testid="summary-total">{total.toFixed(2)}€</span></div>
                <button className="btn btn-primary btn-large" style={{ width: "100%", marginTop: 20 }} onClick={() => setShowCheckout(true)} data-testid="checkout-btn">&#128274; Поръчай!</button>
                <div className="trust-badges">
                  <div className="trust-item"><span className="trust-icon">&#9989;</span><span>Защитено плащане</span></div>
                  <div className="trust-item"><span className="trust-icon">&#9989;</span><span>Безплатна доставка</span></div>
                  <div className="trust-item"><span className="trust-icon">&#9989;</span><span>30 дни право на връщане</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      {showCheckout && (
        <div className="modal-overlay modal-visible" onClick={() => setShowCheckout(false)} data-testid="checkout-modal">
          <div className="modal-content checkout-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCheckout(false)}>&#215;</button>
            <h3>&#128640; Готов за поръчка?</h3>
            <div className="modal-actions">
              <Link to="/contact" className="btn btn-primary" data-testid="checkout-contact-btn">Свържи се с нас за поръчка</Link>
              <button className="btn btn-outline" onClick={() => setShowCheckout(false)} data-testid="checkout-continue-btn">Продължи с пазаруването</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// CONTACT PAGE
function ContactPage() {
  const [sent, setSent] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); setSent(true); };

  return (
    <>
      <section className="page-header" data-testid="contact-page-header">
        <div className="container">
          <h1 className="page-title animate-fade-in-up">Имаш нужда от помощ?</h1>
          <p className="page-description animate-fade-in-up">Въпрос? Съвет? Ние сме на разположение – свържете се с нас.</p>
        </div>
      </section>
      <section className="contact-section" data-testid="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-form-wrapper animate-on-scroll">
              <h2 className="form-title">Изпрати ни запитване</h2>
              {sent ? (
                <div className="success-message" data-testid="contact-success">
                  <h3>&#9989; Съобщението е изпратено!</h3>
                  <p>Благодарим ти, че се свърза с нас! Очаквай отговор в рамките на 24 часа.</p>
                  <button className="btn btn-primary" onClick={() => setSent(false)}>Изпрати ново запитване</button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit} data-testid="contact-form">
                  <div className="form-row">
                    <div className="form-group"><label htmlFor="name">Име *</label><input type="text" id="name" required placeholder="John Doe" data-testid="contact-name" /></div>
                    <div className="form-group"><label htmlFor="email">Email *</label><input type="email" id="email" required placeholder="john@example.com" data-testid="contact-email" /></div>
                  </div>
                  <div className="form-group"><label htmlFor="subject">Предмет</label><input type="text" id="subject" placeholder="Как можем да Ви помогнем?" data-testid="contact-subject" /></div>
                  <div className="form-group"><label htmlFor="message">Запитване *</label><textarea id="message" rows="6" required placeholder="Разкажи ни повече..." data-testid="contact-message"></textarea></div>
                  <button type="submit" className="btn btn-primary btn-large" data-testid="contact-submit">&#128231; Изпрати</button>
                </form>
              )}
            </div>
            <div className="contact-info-wrapper">
              <div className="contact-info-card animate-on-scroll">
                <h3 className="info-card-title">Нашите контакти</h3>
                <div className="info-item"><div className="info-icon">&#128231;</div><div><p className="info-label">Email</p><a href="mailto:support@partypixels.com" className="info-value">support@partypixels.com</a></div></div>
                <div className="info-item"><div className="info-icon">&#128222;</div><div><p className="info-label">Телефон</p><a href="tel:+15551234567" className="info-value">+1 (555) 123-4567</a></div></div>
                <div className="info-item"><div className="info-icon">&#128205;</div><div><p className="info-label">Адрес</p><p className="info-value">123 Innovation Drive<br />San Francisco, CA 94103</p></div></div>
                <div className="info-item"><div className="info-icon">&#128336;</div><div><p className="info-label">Работно време</p><p className="info-value">Всеки ден: 08:00-18:00</p></div></div>
              </div>
              <div className="faq-cta-card animate-on-scroll" style={{ animationDelay: "0.2s" }}>
                <div className="faq-icon">&#9989;</div>
                <h3 className="faq-title">Трябва ти по-бърз отговор?</h3>
                <p className="faq-text">Разгледай нашата секция с най-често задаваните въпроси.</p>
                <a href="#!" className="btn btn-outline">Често задавани въпроси</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// APP
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <CartProvider>
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
          <Footer />
        </CartProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
