# PantryPilot UI Specification - Comprehensive Feature List

## 📱 Mobile App UI Components

### 🏠 **Dashboard Screen (Home)**

**Purpose**: At-a-glance overview of household inventory status and quick actions

**Components**:

- **Welcome Header**: "Good morning, [Name]! Your pantry is 85% stocked"
- **Quick Stats Cards**:
  - Items expiring in next 3 days (with count and urgency indicator)
  - Low stock items (with count and shopping list integration)
  - Monthly spending vs budget (progress bar)
  - Food waste saved this month ($ amount)
- **Smart Actions Bar**:
  - "Add Items" button (camera/voice/scan options)
  - "Quick Shopping List" (AI-generated based on needs)
  - "Expiry Alert" (tappable for details)
- **Recent Activity Feed**: Last 5 actions (items added, used, expiring)
- **Weather-based Suggestions**: "Hot weather expected - stock up on drinks and ice cream"

### 📦 **Inventory Management Screen**

**Purpose**: Complete inventory view with search, filter, and management capabilities

**Components**:

- **Search Bar**: Voice-enabled "Find milk" or text search with autocomplete
- **Filter Options**:
  - By location (Fridge, Pantry, Freezer, Cupboard)
  - By category (Dairy, Produce, Grains, Proteins, etc.)
  - By expiry status (Fresh, Expiring Soon, Expired)
  - By stock level (Low, Normal, High)
- **View Toggle**: Grid view (cards) vs List view (detailed rows)
- **Item Cards Display**:
  - Product image (auto-populated from barcode/scan)
  - Item name and brand
  - Current quantity with unit (2.5 liters, 500g, 6 cans)
  - Location indicator with icon
  - Expiry date with color coding (green/yellow/red)
  - Price per unit and last purchase date
  - Quick actions: Use, Add More, Move Location
- **Floating Action Button**: "+" to add new items
- **Bulk Operations**: Select multiple items for bulk actions

### 🛒 **Shopping List Screen**

**Purpose**: Smart shopping list generation and management

**Components**:

- **List Header**: "12 items • Est. $156 • Best store: New World"
- **Store Selector**: Toggle between stores with price comparisons
- **Smart Suggestions Section**:
  - "Based on your habits, you might also need..."
  - "Items on sale at your selected store"
  - "Seasonal recommendations"
- **Shopping List Items**:
  - Checkbox for each item
  - Item name and required quantity
  - Estimated price and store-specific pricing
  - Aisle location (when in-store mode)
  - Alternative suggestions if out of stock
- **List Management**:
  - "Add Manual Item" button
  - "Clear Completed Items"
  - "Share List" (WhatsApp, SMS, etc.)
  - "Print List" option
- **Budget Tracker**: Running total with budget warnings
- **In-Store Mode**: Camera view with AR overlay showing item locations

### 🔔 **Notifications & Alerts Screen**

**Purpose**: Centralized alert management and notifications

**Components**:

- **Alert Categories**:
  - Urgent (expiring today, critical low stock)
  - Important (expiring this week, price alerts)
  - Informational (recommendations, insights)
- **Alert Cards**:
  - Alert type icon and color coding
  - Message with actionable information
  - Time stamp
  - Action buttons ("Add to cart", "Use now", "Snooze")
- **Notification Settings**:
  - Customizable alert thresholds
  - Quiet hours configuration
  - Alert frequency preferences
  - Push notification toggles
- **Alert History**: Past notifications with resolution status

### 📊 **Analytics & Insights Screen**

**Purpose**: Detailed analytics and consumption insights

**Components**:

- **Time Period Selector**: Week, Month, Quarter, Year, Custom
- **Key Metrics Dashboard**:
  - Total spending with trend line
  - Food waste reduction ($ and kg)
  - Most/least used items
  - Cost savings from smart shopping
- **Interactive Charts**:
  - Spending by category (pie chart)
  - Consumption trends over time (line graph)
  - Price comparison by store (bar chart)
  - Expiry rate analysis (area chart)
- **Insights Cards**:
  - "You saved $45 this month by buying milk on sale"
  - "Consider reducing snack purchases - up 20% this month"
  - "Your vegetable consumption increases 30% in summer"
- **Export Options**: PDF reports, CSV data export

### 🍳 **Meal Planning & Recipe Screen**

**Purpose**: Recipe suggestions and meal planning integration

**Components**:

- **"What Can I Make?" Section**:
  - Input field for available ingredients
  - Recipe suggestions based on inventory
  - Difficulty ratings and prep times
- **Recipe Cards**:
  - Recipe image and name
  - Ingredients list with availability status
  - Missing ingredients (tap to add to shopping list)
  - Instructions preview
  - Nutritional information
- **Meal Calendar**:
  - Weekly view with meal slots
  - Drag-and-drop recipe assignment
  - Automatic ingredient reservation
  - Serving size adjustments
- **Recipe Bookmarks**: Save favorite recipes
- **Dietary Preferences**: Filter by gluten-free, vegetarian, etc.

### ⚙️ **Settings & Preferences Screen**

**Purpose**: User preferences, household management, and app configuration

**Components**:

- **Profile Section**:
  - User avatar and name
  - Household size and members
  - Dietary restrictions and preferences
- **Household Management**:
  - Add/remove family members
  - Permission levels (Adult, Teen, Child, Guest)
  - Shared vs personal items
- **Shopping Preferences**:
  - Preferred stores with priority order
  - Budget limits (weekly/monthly)
  - Brand preferences and substitutions
- **Notification Settings**:
  - Alert types and timing
  - Quiet hours
  - Sound and vibration options
- **Data & Privacy**:
  - Export data
  - Privacy settings
  - Account security options
- **App Settings**:
  - Theme (Light/Dark/Auto)
  - Language selection
  - Units (Metric/Imperial)
  - Backup and sync settings

### 🔐 **Authentication Screen**

**Purpose**: User login, registration, and security

**Components**:

- **Login Form**:
  - Email/phone input
  - Password field with show/hide
  - Biometric login option (fingerprint/face)
  - "Remember me" toggle
- **Registration**:
  - Name, email, password
  - Household setup wizard
  - Initial preferences
- **Security Features**:
  - Two-factor authentication
  - Password recovery
  - Session management
- **Social Login**: Google, Apple, Facebook options

## 🌐 **Web Dashboard UI Components**

### 📈 **Admin Dashboard (Desktop)**

**Purpose**: Comprehensive household management and analytics

**Components**:

- **Navigation Sidebar**:
  - Dashboard, Inventory, Shopping, Analytics, Recipes, Settings
  - Household switcher (for multiple households)
- **Main Dashboard Area**:
  - Real-time inventory status with charts
  - Spending analytics with interactive graphs
  - Recent transactions and activities
  - Upcoming alerts and recommendations
- **Quick Actions Panel**:
  - Add items, Generate lists, View reports
  - Bulk import/export operations
- **Household Overview**:
  - Member activity and contributions
  - Shared expenses and budgets
  - Permission management

### 📋 **Inventory Management (Web)**

**Purpose**: Detailed inventory management with bulk operations

**Components**:

- **Advanced Search**: Multiple filters, Boolean operators
- **Bulk Import**: CSV upload, barcode scanning via webcam
- **Table View**: Sortable columns with advanced filtering
- **Batch Operations**: Mass updates, location changes, expiry updates
- **Print Labels**: Generate QR/barcode labels for items
- **Audit Log**: Complete change history with user attribution

### 📊 **Advanced Analytics (Web)**

**Purpose**: Deep dive analytics with custom reports

**Components**:

- **Custom Report Builder**: Drag-and-drop report creation
- **Data Visualization**: Interactive charts with drill-down capability
- **Trend Analysis**: Predictive analytics and forecasting
- **Comparative Analysis**: Year-over-year, month-over-month comparisons
- **Export Center**: Multiple format exports (PDF, Excel, CSV)
- **Scheduled Reports**: Automated email reports

## 🎯 **Cross-Platform Features**

### 🗣️ **Voice Integration**

- **Voice Commands**: "Add milk to fridge", "What's expiring?", "Add cheese to shopping list"
- **Voice Feedback**: Spoken responses and confirmations
- **Multi-language Support**: Voice recognition in multiple languages
- **Accent Adaptation**: Learns user's voice patterns

### 📷 **Camera & Vision Features**

- **Barcode Scanning**: Rapid item addition with product lookup
- **Receipt OCR**: Automatic item extraction from shopping receipts
- **Expiry Date Recognition**: Capture dates from packaging
- **AR Overlays**: In-store guidance and item location
- **Visual Search**: Identify items by taking photos

### 🔔 **Smart Notification System**

- **Contextual Alerts**: Time, location, and usage pattern aware
- **Predictive Notifications**: Alert before items run out
- **Smart Grouping**: Related alerts combined
- **Actionable Notifications**: Direct actions from notification
- **Do Not Disturb**: Respect user's schedule and preferences

### 🤖 **AI-Powered Features**

- **Smart Categorization**: Automatic item categorization
- **Consumption Prediction**: ML-based usage forecasting
- **Price Optimization**: Best time and place to buy
- **Recipe Recommendations**: Personalized meal suggestions
- **Anomaly Detection**: Unusual pattern alerts

## 🎨 **Design System & UI Elements**

### 🎯 **Core Design Principles**

- **Mobile-First**: Responsive design optimized for phones
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Fast loading and smooth interactions
- **Intuitive**: Minimal learning curve for all ages
- **Consistent**: Unified design language across platforms

### 🎨 **Visual Design Elements**

- **Color Palette**: Fresh, modern colors with food-related associations
- **Typography**: Clear, readable fonts with proper hierarchy
- **Icons**: Consistent icon set for actions and categories
- **Spacing**: Generous white space for readability
- **Micro-interactions**: Subtle animations and feedback

### 📱 **Mobile-Specific UI Patterns**

- **Bottom Navigation**: Easy thumb reach for primary actions
- **Swipe Gestures**: Natural interactions for common tasks
- **Pull to Refresh**: Update content with intuitive gesture
- **Long Press**: Context menus and additional options
- **Haptic Feedback**: Tactile responses for actions

### 🖥️ **Web-Specific UI Patterns**

- **Keyboard Shortcuts**: Power user productivity features
- **Drag & Drop**: Intuitive organization and planning
- **Right-Click Menus**: Contextual actions
- **Multi-Window**: Side-by-side views for comparison
- **Print Optimization**: Clean, readable print layouts

## 🔧 **Technical UI Features**

### ⚡ **Performance Features**

- **Offline Mode**: Full functionality without internet
- **Lazy Loading**: Fast initial load times
- **Image Optimization**: Compressed images with placeholders
- **Caching Strategy**: Smart data caching for speed
- **Background Sync**: Seamless data synchronization

### 🔒 **Security UI Elements**

- **Biometric Authentication**: Fingerprint/face ID
- **Two-Factor Auth**: Secure login process
- **Privacy Indicators**: Visual privacy status
- **Permission Requests**: Clear permission explanations
- **Data Encryption**: Visual security indicators

### 🌍 **Internationalization**

- **Multi-language Support**: 10+ languages
- **Currency Localization**: Local currency and formatting
- **Date/Time Formats**: Regional preferences
- **Cultural Adaptation**: Local shopping patterns and preferences
- **RTL Support**: Right-to-left language support

## 📊 **Success Metrics & KPIs**

### 🎯 **User Engagement Metrics**

- **Daily Active Users**: Target 70% of registered users
- **Feature Adoption**: 80% of users using core features within 30 days
- **Session Duration**: Average 5+ minutes per session
- **Retention Rate**: 60% monthly retention

### 💰 **Business Impact Metrics**

- **Food Waste Reduction**: 40% average reduction per household
- **Cost Savings**: $180-250 average monthly savings per user
- **User Satisfaction**: 4.5+ star rating in app stores
- **Referral Rate**: 30% of new users from referrals

### 🔧 **Technical Performance Metrics**

- **Load Time**: <3 seconds initial load
- **Crash Rate**: <0.1% crash-free sessions
- **API Response**: <200ms average response time
- **Offline Functionality**: 100% core features work offline

This comprehensive UI specification covers all the interfaces and features needed for the PantryPilot application, from basic inventory management to advanced AI-powered insights and multi-platform support.



import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, Home, ShoppingCart, ChefHat, Package, Plus, Clock, 
  ChevronRight, MoreVertical, Filter, User, Bell, CheckCircle2, 
  AlertCircle, ScanLine, ArrowRight, Zap, Activity, Layers, 
  Mic, Send, X, Bot, RefreshCw, BarChart3, Settings, 
  Calendar, MapPin, Wallet, TrendingUp, Pizza, Info, Trash2
} from 'lucide-react';

// --- MOCK DATA ENGINE ---
const MOCK_USER = { name: "Dylan", householdSize: 3, budget: 800, spent: 612 };

const MOCK_PANTRY = [
  { id: 1, name: 'Whole Milk', qty: '1.2L', category: 'Dairy', location: 'Fridge', status: 'expiring', daysLeft: 2, price: 4.50 },
  { id: 2, name: 'Chicken Breast', qty: '500g', category: 'Meat', location: 'Freezer', status: 'fresh', daysLeft: 4, price: 12.00 },
  { id: 3, name: 'Basmati Rice', qty: '2kg', category: 'Grains', location: 'Pantry', status: 'stable', daysLeft: 120, price: 8.50 },
  { id: 4, name: 'Avocados', qty: '3', category: 'Produce', location: 'Cupboard', status: 'expiring', daysLeft: 1, price: 6.00 },
  { id: 5, name: 'Eggs', qty: '12pk', category: 'Dairy', location: 'Fridge', status: 'fresh', daysLeft: 10, price: 5.50 },
];

const CATEGORIES = ['All', 'Dairy', 'Produce', 'Meat', 'Grains', 'Snacks'];
const LOCATIONS = ['All', 'Fridge', 'Pantry', 'Freezer', 'Cupboard'];

// --- UI COMPONENTS ---

const Card = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/40 backdrop-blur-md p-5 shadow-inner-white transition-all active:scale-[0.98] ${className}`}
  >
    {children}
  </div>
);

const ProgressBar = ({ progress, color = "bg-cyan-500" }) => (
  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
    <div 
      className={`h-full ${color} transition-all duration-1000 ease-out`} 
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

// --- VIEWS ---

const DashboardView = ({ onNavigate }) => (
  <div className="px-6 pb-32 pt-4 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
    {/* Welcome Header */}
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Operations Hub</h2>
        <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">System Status: 85% Stocked</p>
      </div>
      <div className="text-right">
        <p className="text-xs font-black text-cyan-400">CLEAR SKIES</p>
        <p className="text-[9px] text-zinc-600 uppercase">Stock drinks & ice</p>
      </div>
    </div>

    {/* Primary Stats */}
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-gradient-to-br from-fuchsia-500/10 to-transparent">
        <AlertCircle size={18} className="text-fuchsia-500 mb-2" />
        <p className="text-2xl font-black text-white">04</p>
        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Expiring Soon</p>
      </Card>
      <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent">
        <TrendingUp size={18} className="text-cyan-500 mb-2" />
        <p className="text-2xl font-black text-white">$42.10</p>
        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Waste Saved</p>
      </Card>
    </div>

    {/* Budget Tracker */}
    <Card>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-zinc-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Budget Status</span>
        </div>
        <span className="text-xs font-black text-cyan-400">$612 / $800</span>
      </div>
      <ProgressBar progress={(612/800)*100} />
    </Card>

    {/* Recent Activity */}
    <div className="space-y-3">
      <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-2">Recent Logs</h3>
      {MOCK_PANTRY.slice(0, 3).map(item => (
        <div key={item.id} className="flex items-center gap-4 bg-white/5 rounded-2xl p-3 border border-white/5">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
            <Package size={16} className="text-zinc-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-white uppercase">{item.name}</p>
            <p className="text-[9px] text-zinc-600 uppercase">System updated 2h ago</p>
          </div>
          <CheckCircle2 size={14} className="text-cyan-500/50" />
        </div>
      ))}
    </div>
  </div>
);

const InventoryView = () => {
  const [filter, setFilter] = useState('All');
  const [location, setLocation] = useState('All');

  return (
    <div className="px-6 pb-32 pt-4 space-y-6 animate-in zoom-in-95 duration-500">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {LOCATIONS.map(loc => (
          <button 
            key={loc}
            onClick={() => setLocation(loc)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              location === loc ? 'bg-cyan-500 border-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-white/5 border-white/10 text-zinc-500'
            }`}
          >
            {loc}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {MOCK_PANTRY.filter(i => (location === 'All' || i.location === location)).map(item => (
          <Card key={item.id} className="flex items-center gap-4 py-4 hover:bg-zinc-800/50">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.status === 'expiring' ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
              <Package size={22} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white uppercase tracking-tight">{item.name}</h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">{item.location}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                <span className="text-[10px] font-bold text-cyan-500 uppercase">{item.qty}</span>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xs font-black tabular-nums ${item.status === 'expiring' ? 'text-fuchsia-400' : 'text-white'}`}>{item.daysLeft}d</p>
              <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-tighter">TTL</p>
            </div>
          </Card>
        ))}
      </div>
      
      <button className="fixed bottom-32 right-6 w-14 h-14 bg-white text-black rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all z-30">
        <Plus size={28} />
      </button>
    </div>
  );
};

const AnalyticsView = () => (
  <div className="px-6 pb-32 pt-4 space-y-8 animate-in fade-in duration-700">
    <header className="flex justify-between items-center">
      <h2 className="text-xl font-black text-white uppercase tracking-tighter">Insights</h2>
      <select className="bg-transparent border-none text-[10px] font-black text-cyan-400 uppercase tracking-widest focus:ring-0">
        <option>This Month</option>
        <option>Quarterly</option>
      </select>
    </header>

    {/* Spending Chart Mock */}
    <Card className="h-64 flex flex-col">
       <div className="flex justify-between items-start mb-6">
         <div>
           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Monthly Spending</p>
           <p className="text-2xl font-black text-white">$612.00</p>
         </div>
         <TrendingUp className="text-green-500" size={20} />
       </div>
       <div className="flex-1 flex items-end justify-between gap-2 px-2">
         {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
           <div key={i} className="flex-1 group relative">
             <div 
               className="w-full bg-gradient-to-t from-cyan-500 to-fuchsia-500 rounded-t-md opacity-40 group-hover:opacity-100 transition-all cursor-pointer" 
               style={{ height: `${h}%` }}
             ></div>
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
               ${h*4}
             </div>
           </div>
         ))}
       </div>
    </Card>

    <div className="grid grid-cols-1 gap-4">
      <Card className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center">
          <Pizza size={20} />
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-zinc-500 font-bold uppercase">Spending Tip</p>
          <p className="text-xs font-bold text-white uppercase">Your snack spending is up 20%</p>
        </div>
      </Card>
      
      <Card className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
          <Trash2 size={20} />
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-zinc-500 font-bold uppercase">Impact</p>
          <p className="text-xs font-bold text-white uppercase">You saved 12kg of food waste</p>
        </div>
      </Card>
    </div>
  </div>
);

// --- AI TERMINAL (TOM) ---
const TomTerminal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Tactical Operations Manager online. Awaiting sync instructions.' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages([...messages, userMsg]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: "Understood. I've logged the 2L Whole Milk to 'Fridge' and recalculated your expiring items list. Should I suggest a recipe for the chicken?"
      }]);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-300 flex flex-col">
      {/* Header */}
      <div className="p-8 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border border-cyan-500/50 flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <Bot size={24} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-widest uppercase">T.O.M. Link</h3>
            <p className="text-[10px] text-cyan-400 font-black tracking-[0.3em] animate-pulse">VOICE SYNC ACTIVE</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 bg-white/5 rounded-full text-zinc-500">
          <X size={24} />
        </button>
      </div>

      {/* Oscilloscope Visualizer */}
      <div className="h-40 flex flex-col items-center justify-center bg-zinc-900/40 relative">
        <div className="flex items-end gap-1 h-12">
          {[...Array(24)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1 bg-cyan-400 rounded-full transition-all duration-300 ${isListening ? 'animate-bounce' : 'h-1 opacity-20'}`}
              style={{ 
                height: isListening ? `${Math.random() * 100 + 10}%` : '4px',
                animationDelay: `${i * 0.05}s`
              }}
            ></div>
          ))}
        </div>
        <div className="absolute bottom-4 text-[9px] font-black text-zinc-700 tracking-[0.5em] uppercase">Frequency: 44.1kHz</div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4`}>
            <div className={`max-w-[85%] p-5 rounded-3xl text-xs font-bold leading-relaxed tracking-wide ${
              m.role === 'user' 
                ? 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(34,211,238,0.2)]' 
                : 'bg-zinc-800 border border-white/5 text-zinc-300'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="p-8 pb-12 bg-zinc-900/80 border-t border-white/10 space-y-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsListening(!isListening)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-fuchsia-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.4)]' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
          >
            <Mic size={24} />
          </button>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="SYNC COMMAND..." 
            className="flex-1 bg-black/50 border border-white/10 rounded-2xl py-4 px-6 text-[11px] font-black tracking-widest text-white uppercase focus:outline-none focus:border-cyan-500/50"
          />
          <button 
            onClick={sendMessage}
            className="w-14 h-14 rounded-2xl bg-cyan-500 text-black flex items-center justify-center active:scale-95 transition-transform"
          >
            <Send size={24} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['"Find milk swaps"', '"What is low?"', '"Expiring today?"'].map(hint => (
            <button 
              key={hint} 
              onClick={() => setInput(hint.replace(/"/g, ''))}
              className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-zinc-500 uppercase whitespace-nowrap hover:text-cyan-400 transition-colors"
            >
              {hint}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MAIN LAYOUT ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const navItems = [
    { id: 'home', icon: Home, label: 'Core' },
    { id: 'pantry', icon: Package, label: 'Vault' },
    { id: 'analytics', icon: BarChart3, label: 'Insights' },
    { id: 'recipes', icon: ChefHat, label: 'Lab' },
    { id: 'settings', icon: Settings, label: 'System' }
  ];

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center selection:bg-cyan-500 selection:text-black">
      {/* Background Aurora Orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[50%] bg-fuchsia-500/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md min-h-screen flex flex-col relative shadow-2xl">
        
        {/* Futurist Header */}
        <header className="px-6 pt-12 pb-6 flex justify-between items-center sticky top-0 bg-[#050505]/80 backdrop-blur-xl z-40">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-fuchsia-500 animate-[spin_6s_linear_infinite]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-10 h-10 object-cover" />
                </div>
             </div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">SYNCED: {MOCK_USER.name}</p>
               <h1 className="text-xl font-black text-white tracking-tighter uppercase">Pantry Pilot</h1>
             </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white relative">
              <Bell size={18} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-fuchsia-500 rounded-full border-2 border-black"></div>
            </button>
            <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <ScanLine size={18} />
            </button>
          </div>
        </header>

        {/* Dynamic Screens */}
        <main className="flex-1 pb-40">
          {activeTab === 'home' && <DashboardView onNavigate={setActiveTab} />}
          {activeTab === 'pantry' && <InventoryView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'recipes' && (
            <div className="px-6 pt-10 text-center animate-in zoom-in-95">
              <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-700 mx-auto mb-6">
                <ChefHat size={48} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Recipe Lab Offline</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest max-w-[200px] mx-auto leading-loose">Initialize ingredient sync via T.O.M. to access meal planning protocols.</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="px-6 space-y-4 animate-in slide-in-from-right-8">
               <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-4">System Settings</h3>
               {['Household Profile', 'Notification Thresholds', 'Storage Locations', 'Network Sync'].map(s => (
                 <Card key={s} className="flex justify-between items-center py-4">
                   <span className="text-xs font-bold text-white uppercase">{s}</span>
                   <ChevronRight size={16} className="text-zinc-600" />
                 </Card>
               ))}
            </div>
          )}
        </main>

        {/* AI HUB Trigger */}
        <div className="fixed bottom-32 right-6 z-40">
           <button 
             onClick={() => setIsAssistantOpen(true)}
             className="w-16 h-16 rounded-3xl bg-black border border-white/20 shadow-[0_0_40px_rgba(34,211,238,0.3)] flex items-center justify-center relative overflow-hidden group active:scale-90 transition-all"
           >
             <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 animate-pulse"></div>
             <Bot size={28} className="text-cyan-400 relative z-10" />
             <div className="absolute w-full h-full border-t-2 border-cyan-400 rounded-full animate-spin opacity-50"></div>
           </button>
        </div>

        {/* Floating Dock Navigation */}
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-[45]">
          <div className="bg-zinc-900/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-2 flex justify-between items-center shadow-2xl shadow-black">
            {navItems.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center h-14 w-14 rounded-full transition-all duration-500 ${
                    isActive ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/40' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <tab.icon size={22} />
                  {isActive && (
                    <span className="absolute -bottom-10 text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400 animate-pulse whitespace-nowrap">
                      {tab.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      <TomTerminal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #000; color: #fff; }
        .shadow-inner-white { box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.05); }
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}