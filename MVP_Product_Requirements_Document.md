# Lot Lizard - Carnival Lot Planning Application
## Comprehensive MVP Product Requirements Document

**Version:** 4.0.0  
**Date:** January 29, 2025  
**Project Status:** Production-Ready MVP  

---

## 🎯 **Executive Summary**

**Lot Lizard** is a professional-grade web application designed for carnival and fair operators to efficiently plan, visualize, and manage their lot layouts. The application combines satellite imagery integration, interactive equipment placement, and precision measurement tools to streamline the complex process of carnival lot planning.

### **Key Value Proposition**
- **Satellite-Powered Planning:** Import real satellite imagery for accurate lot visualization
- **Professional Equipment Library:** Comprehensive database of carnival rides, games, and facilities
- **Precision Measurement Tools:** Advanced calibration and measurement capabilities
- **Cross-Platform Support:** Desktop and tablet-optimized interfaces
- **Export & Collaboration:** PDF export and project sharing capabilities

---

## 👥 **Target Customer & Use Cases**

### **Primary Customers**
1. **Carnival Operators & Route Managers**
   - Plan seasonal routes and lot layouts
   - Optimize space utilization and traffic flow
   - Ensure compliance with safety clearances

2. **Fair Organizers & Event Planners**
   - Design county fair and festival layouts
   - Coordinate vendor and ride placement
   - Manage space allocation and logistics

3. **Equipment Rental Companies**
   - Plan equipment delivery and setup
   - Visualize space requirements for clients
   - Optimize transportation and logistics

### **Core Use Cases**

#### **1. New Lot Planning**
- Import satellite imagery of venue location
- Calibrate scale using known distances
- Place equipment from comprehensive library
- Verify clearances and safety requirements
- Export professional layout plans

#### **2. Route Planning & Optimization**
- Compare multiple venue options
- Standardize equipment configurations
- Plan seasonal route logistics
- Share layouts with setup crews

#### **3. Compliance & Safety Verification**
- Ensure proper ride clearances
- Verify emergency access routes
- Document safety compliance
- Generate official layout documentation

---

## 🚀 **Core Features & Capabilities**

### **1. Canvas-Based Layout Editor**
- **Interactive Canvas:** 250,000 sq ft working area (500' × 500')
- **Zoom & Pan:** 4% to 200% zoom with smooth navigation
- **Grid System:** Configurable grid overlay for precise alignment
- **Multi-Select:** Bulk operations on multiple equipment items
- **Undo/Redo:** Full action history management

### **2. Satellite Imagery Integration**
- **Google Maps Import:** Direct URL import with automatic scaling
- **High-Resolution Support:** Up to 2048×2048 ultra-quality imagery
- **Rectangular Import:** Support for landscape/portrait orientations
- **Coverage Multiplier:** Import larger areas for context
- **Scale Calibration:** Precision measurement tools for accurate scaling

### **3. Equipment Library System**
- **Comprehensive Database:** 100+ carnival rides, games, and facilities
- **Categories:** Mega Rides, Rides, Kiddy Rides, Food, Games, Equipment, Office, Home, Bunks
- **Custom Equipment:** Add and modify equipment specifications
- **Detailed Specifications:**
  - Dimensions (width, height, depth)
  - Weight and capacity
  - Power requirements
  - Turn-around time
  - Vertical height
  - Safety clearances

### **4. Advanced Measurement Tools**
- **Distance Measurement:** Two-click distance calculation
- **Area Calculation:** Multi-point polygon area measurement
- **Perimeter Measurement:** Perimeter calculation with closing segments
- **Calibration System:** Scale verification using known distances
- **Visual Feedback:** Real-time measurement display with labels

### **5. Equipment Manipulation**
- **Drag & Drop:** Intuitive placement and repositioning
- **Rotation:** In-place rotation with visual handles
- **Snap-to-Grid:** Automatic alignment assistance
- **Clearance Zones:** Visual safety clearance indicators
- **Duplication:** Quick copy and paste functionality

### **6. Project Management**
- **Save/Load:** Complete project state persistence
- **Export/Import:** JSON-based project sharing
- **Auto-Save:** Automatic progress preservation
- **Version Control:** Project versioning and history
- **Equipment Library Sync:** Custom equipment travels with projects

### **7. Professional Output**
- **PDF Export:** High-quality layout documentation
- **Scale Bars:** Professional measurement references
- **Equipment Labels:** Detailed equipment information
- **Clearance Visualization:** Safety zone documentation

### **8. Cross-Platform Interface**

#### **Desktop Interface**
- **Full-Featured Editor:** Complete toolset access
- **Sidebar Navigation:** Equipment library and properties
- **Keyboard Shortcuts:** Power-user efficiency
- **Multi-Monitor Support:** Extended workspace capabilities

#### **Tablet Interface (iPad Optimized)**
- **Touch-First Design:** iOS-style interface patterns
- **Bottom Navigation:** Thumb-friendly control placement
- **Floating Controls:** Context-sensitive tool access
- **Gesture Support:** Pinch-to-zoom and touch gestures
- **Slide-Up Modals:** Native mobile interaction patterns

---

## 🏗️ **Technical Architecture**

### **Frontend Stack**
- **Framework:** Next.js 15.4.4 (React 18)
- **Canvas Engine:** Konva.js + React-Konva
- **Styling:** Tailwind CSS 3.4.1
- **Icons:** Heroicons 2.2.0
- **TypeScript:** Full type safety

### **Key Libraries & Dependencies**
- **html2canvas:** Screenshot generation for PDF export
- **jsPDF:** PDF document generation
- **Google Maps Static API:** Satellite imagery integration

### **Architecture Patterns**
- **Component-Based:** Modular React component architecture
- **State Management:** React Context + useState/useReducer
- **Event-Driven:** Canvas event handling with Konva
- **Responsive Design:** Mobile-first responsive patterns
- **Progressive Enhancement:** Desktop → Tablet → Mobile optimization

### **Performance Optimizations**
- **Canvas Virtualization:** Efficient rendering of large layouts
- **Image Optimization:** Lazy loading and compression
- **Memory Management:** Efficient state updates and cleanup
- **Bundle Optimization:** Code splitting and tree shaking

### **Data Models**

#### **Equipment Definition**
```typescript
interface Equipment {
  id: string;
  name: string;
  category: string;
  shape: 'rectangle' | 'circle';
  dimensions: {
    width?: number;
    height?: number;
    radius?: number;
  };
  specifications: {
    weight?: number;
    rideCapacity?: number;
    turnAroundTime?: number;
    verticalHeight?: number;
    rideClearing?: number;
  };
  clearance: number;
  fencePadding: number;
}
```

#### **Project Data**
```typescript
interface ProjectData {
  name: string;
  description: string;
  placedEquipment: PlacedEquipment[];
  backgroundImages: BackgroundImage[];
  equipmentLibraryState: EquipmentLibraryState;
  canvasSettings: CanvasSettings;
  measurements: Measurement[];
}
```

---

## 🎨 **User Experience Design**

### **Design Principles**
1. **Professional First:** Clean, business-appropriate interface
2. **Touch-Optimized:** Tablet-friendly interactions and sizing
3. **Visual Clarity:** High contrast, readable typography
4. **Contextual Controls:** Tools appear when needed
5. **Progressive Disclosure:** Advanced features accessible but not overwhelming

### **Color Scheme**
- **Primary:** Blue (#3b82f6) - Professional, trustworthy
- **Success:** Green (#22c55e) - Calibrated measurements, success states
- **Warning:** Orange (#ff8c00) - Edit mode, attention required
- **Error:** Red (#ef4444) - Deletion, error states
- **Neutral:** Gray scales for backgrounds and text

### **Typography**
- **System Fonts:** Platform-native font stacks
- **Hierarchy:** Clear heading and body text distinction
- **Readability:** High contrast ratios for accessibility

### **Interaction Patterns**
- **Click/Tap:** Primary selection and activation
- **Drag:** Equipment movement and canvas panning
- **Pinch/Zoom:** Scale adjustment on touch devices
- **Double-Click:** Measurement completion
- **Right-Click/Long-Press:** Context menus

---

## 📊 **Business Model & Market Opportunity**

### **Market Size**
- **Traveling Carnivals:** 300+ operators in North America
- **County Fairs:** 3,000+ annual events
- **Festival Market:** $4.2B industry with growing digital adoption

### **Revenue Streams**
1. **SaaS Subscription:** Monthly/annual licensing
2. **Professional Services:** Custom setup and training
3. **Enterprise Licensing:** Multi-user organization plans
4. **API Integration:** Third-party software integration

### **Competitive Advantages**
1. **Industry-Specific:** Purpose-built for carnival/fair planning
2. **Satellite Integration:** Real-world accuracy and context
3. **Cross-Platform:** Desktop and tablet optimization
4. **Professional Output:** Export-ready documentation
5. **Equipment Database:** Comprehensive industry equipment library

---

## 🚧 **Development Roadmap**

### **Phase 1: MVP (Current - Complete)**
- ✅ Core canvas editor with equipment placement
- ✅ Satellite imagery integration
- ✅ Basic measurement tools
- ✅ Project save/load functionality
- ✅ Tablet interface optimization

### **Phase 2: Professional Features**
- 🔄 Advanced equipment specifications database
- 🔄 Power and utility planning tools
- 🔄 Maintenance scheduling integration
- 🔄 Cost estimation and budgeting
- 🔄 Multi-user collaboration

### **Phase 3: Enterprise Integration**
- 📋 API development for third-party integration
- 📋 Advanced reporting and analytics
- 📋 Compliance and safety documentation
- 📋 Route planning optimization
- 📋 Mobile app development

### **Phase 4: Market Expansion**
- 📋 International market adaptation
- 📋 Multi-language support
- 📋 Industry-specific customizations
- 📋 Advanced AI/ML features

---

## 🔧 **Technical Requirements**

### **Browser Support**
- **Desktop:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile:** iOS Safari 14+, Chrome Mobile 90+
- **Tablet:** iPad Safari 14+, Android Chrome 90+

### **System Requirements**
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 100MB for application, additional for projects
- **Network:** Broadband internet for satellite imagery
- **Graphics:** Hardware acceleration recommended

### **API Dependencies**
- **Google Maps Static API:** Satellite imagery retrieval
- **Google Maps Geocoding API:** Location search and validation

---

## 📈 **Success Metrics & KPIs**

### **User Engagement**
- **Daily Active Users:** Target 100+ within 6 months
- **Session Duration:** Average 45+ minutes per session
- **Project Creation:** 5+ projects per active user
- **Feature Adoption:** 80%+ equipment library usage

### **Business Metrics**
- **Customer Acquisition Cost:** <$200 per customer
- **Monthly Recurring Revenue:** $50K within 12 months
- **Customer Lifetime Value:** $2,000+ per customer
- **Churn Rate:** <5% monthly churn

### **Technical Performance**
- **Page Load Time:** <3 seconds initial load
- **Canvas Performance:** 60fps at 100+ equipment items
- **Uptime:** 99.9% availability
- **Error Rate:** <0.1% critical errors

---

## 🛡️ **Security & Compliance**

### **Data Protection**
- **Encryption:** TLS 1.3 for data in transit
- **Storage:** Encrypted data at rest
- **Privacy:** No personal data collection beyond necessary
- **Backup:** Automated daily backups with 30-day retention

### **Compliance Considerations**
- **GDPR:** European data protection compliance
- **CCPA:** California privacy law compliance
- **Industry Standards:** Carnival industry safety standards
- **Accessibility:** WCAG 2.1 AA compliance

---

## 📞 **Support & Documentation**

### **User Documentation**
- **Getting Started Guide:** Step-by-step onboarding
- **Feature Documentation:** Comprehensive feature guides
- **Video Tutorials:** Visual learning resources
- **FAQ:** Common questions and solutions

### **Technical Documentation**
- **API Documentation:** Developer integration guides
- **Deployment Guide:** Self-hosting instructions
- **Troubleshooting:** Common technical issues
- **Best Practices:** Optimization recommendations

---

## 🎯 **Conclusion**

Lot Lizard represents a significant advancement in carnival and fair planning technology. By combining satellite imagery, professional equipment libraries, and precision measurement tools in an intuitive cross-platform interface, the application addresses real industry pain points while providing a foundation for future growth and expansion.

The MVP is production-ready with a comprehensive feature set that serves the immediate needs of carnival operators while establishing a platform for advanced professional features and enterprise integration.

**Next Steps:**
1. Deploy production environment
2. Conduct beta testing with industry partners
3. Gather user feedback and iterate
4. Plan Phase 2 feature development
5. Establish go-to-market strategy

---

*This document serves as the comprehensive product specification for Task Master and future development planning.*
