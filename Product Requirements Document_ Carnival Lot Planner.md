# Product Requirements Document: Carnival Lot Planner

## 1. Introduction

This Product Requirements Document (PRD) outlines the features, functionalities, and technical specifications for the Carnival Lot Planner application. This application is specifically designed to assist lot managers in the carnival industry with the efficient and strategic layout of ride equipment and other attractions within a fairground space. The primary goal is to optimize space utilization, ensure safety, and streamline the planning process for temporary event setups. This document will detail the scope of the project, including the Minimum Viable Product (MVP) and future considerations, along with relevant technical implementations.

## 2. Project Overview

The Carnival Lot Planner application aims to provide a specialized and intuitive platform for carnival lot managers to digitally plan and manage the placement of their ride equipment, food stalls, games, and other infrastructure. Recognizing the unique challenges of temporary fairground setups, this tool will offer features that facilitate precise spatial planning, adherence to safety regulations, and efficient logistical coordination. The application will leverage modern web technologies and potentially mobile platforms to offer flexibility and accessibility for on-site management.

## 3. Goals and Objectives

*   **Optimize Space Utilization:** Enable lot managers to efficiently arrange ride equipment and attractions within a given fairground area, maximizing capacity and flow.
*   **Enhance Safety Planning:** Facilitate the placement of equipment in compliance with safety regulations and operational clearances.
*   **Streamline Planning Process:** Reduce the time and effort required for manual layout planning through intuitive digital tools.
*   **Improve Communication:** Provide a clear visual representation of the layout for better communication among teams, vendors, and regulatory bodies.
*   **Support On-Site Management:** Offer tools that are accessible and usable in the field, potentially with offline capabilities.

## 4. Target Audience

The primary target audience for the Carnival Lot Planner application includes:

*   **Carnival Lot Managers:** Individuals responsible for the logistical planning and execution of fairground layouts.
*   **Carnival Owners/Operators:** Stakeholders who need an overview of event layouts for strategic decision-making and compliance.
*   **Ride and Attraction Supervisors:** Personnel who require precise placement information for setup and operation.
*   **Safety and Regulatory Officials:** Individuals who need to review and approve fairground layouts for safety and compliance.

## 5. Minimum Viable Product (MVP)

The MVP for the Carnival Lot Planner will focus on delivering core functionality that addresses the immediate needs of lot managers in planning equipment layout, while establishing a foundation for future enhancements. The key features of the MVP include:

### 5.1. Core Functionality

*   **Interactive Fairground Map/Canvas:** A digital canvas where users can import or define the dimensions of a fairground area.
*   **Basic Equipment Placement:** Ability to select from a predefined library of generic ride equipment (e.g., large ride, medium ride, small ride, food stall) and place them on the canvas.
*   **Drag-and-Drop Interface:** Intuitive drag-and-drop functionality for positioning equipment.
*   **Rotation and Resizing:** Basic tools to rotate and resize equipment representations on the canvas.
*   **Collision Detection (Basic):** Visual indicators or warnings when equipment overlaps.
*   **Save and Load Layouts:** Ability to save planned layouts and load them for future editing or reference.
*   **Basic Measurement Tools:** Tools to measure distances between objects or from boundaries.

### 5.2. Technical Implementation for MVP

Given the previous context of the iPad Pro fork, the MVP will leverage a similar technical stack, adapting it for the specific needs of carnival lot planning. The core will involve a web-based application with potential for mobile deployment.

#### 5.2.1. Project Setup and Dependencies

The project will be initialized with a modern web framework (e.g., Next.js, React) to provide a robust and scalable foundation. Key dependencies will include libraries for interactive canvas drawing and gesture handling.

```bash
# Example: Initializing a React project (adjust as per final framework choice)
npx create-react-app carnival-lot-planner --template typescript
cd carnival-lot-planner

# Core canvas and drawing library (e.g., Konva.js or similar)
npm install konva react-konva

# Optional: Gesture handling library if complex touch interactions are needed
npm install @use-gesture/react react-spring
```

#### 5.2.2. Interactive Canvas Component

A central component will be the interactive canvas, built using a library like Konva.js. This canvas will allow users to visually arrange equipment.

```typescript
// Example: Basic Konva.js setup for a canvas
import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle } from 'react-konva';

interface EquipmentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ride' | 'stall' | 'game';
  id: string;
}

const CarnivalCanvas: React.FC = () => {
  const stageRef = useRef<any>();
  const [equipment, setEquipment] = React.useState<EquipmentProps[]>([
    { x: 50, y: 50, width: 100, height: 100, type: 'ride', id: 'ride-1' },
    { x: 200, y: 150, width: 80, height: 80, type: 'stall', id: 'stall-1' },
  ]);

  const handleDragEnd = (e: any, id: string) => {
    const newEquipment = equipment.map((item) => {
      if (item.id === id) {
        return { ...item, x: e.target.x(), y: e.target.y() };
      }
      return item;
    });
    setEquipment(newEquipment);
    // Implement basic collision detection here
  };

  return (
    <Stage width={window.innerWidth} height={window.innerHeight} ref={stageRef}>
      <Layer>
        {equipment.map((item) => (
          <Rect
            key={item.id}
            x={item.x}
            y={item.y}
            width={item.width}
            height={item.height}
            fill={item.type === 'ride' ? 'red' : 'green'}
            draggable
            onDragEnd={(e) => handleDragEnd(e, item.id)}
            stroke=



              {item.type === 'ride' ? 'darkred' : 'darkgreen'}
            strokeWidth={2}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default CarnivalCanvas;
```

#### 5.2.3. Equipment Library and Properties

The application will maintain a simple data structure for different types of equipment, allowing for easy expansion in future phases.

```typescript
// src/data/equipmentTypes.ts
export const equipmentTypes = [
  { id: 'large-ride', name: 'Large Ride', defaultWidth: 150, defaultHeight: 150, color: 'red' },
  { id: 'medium-ride', name: 'Medium Ride', defaultWidth: 100, defaultHeight: 100, color: 'orange' },
  { id: 'small-ride', name: 'Small Ride', defaultWidth: 75, defaultHeight: 75, color: 'yellow' },
  { id: 'food-stall', name: 'Food Stall', defaultWidth: 50, defaultHeight: 70, color: 'green' },
  { id: 'game-booth', name: 'Game Booth', defaultWidth: 60, defaultHeight: 60, color: 'blue' },
];

// Example of how to use in a component to add new equipment
// import { equipmentTypes } from '@/data/equipmentTypes';
// const newRide = equipmentTypes.find(type => type.id === 'large-ride');
// if (newRide) { /* add to canvas */ }
```

#### 5.2.4. Data Persistence (Local Storage/IndexedDB)

Layouts will be saved locally to allow users to continue their work. For the MVP, a simple local storage solution will be implemented, with a clear path to upgrade to IndexedDB for more complex data.

```typescript
// src/lib/layoutStorage.ts
export const saveLayout = (layout: any[]) => {
  localStorage.setItem('carnival-layout', JSON.stringify(layout));
  console.log('Layout saved locally.');
};

export const loadLayout = () => {
  const savedLayout = localStorage.getItem('carnival-layout');
  return savedLayout ? JSON.parse(savedLayout) : [];
};

// Example usage in a React component:
// useEffect(() => {
//   const loadedLayout = loadLayout();
//   if (loadedLayout.length > 0) {
//     setEquipment(loadedLayout);
//   }
// }, []);
// const handleSave = () => saveLayout(equipment);
```

## 6. Future Considerations (Beyond MVP)

Upon successful completion and validation of the MVP, the following features and enhancements will be considered for future development phases:

*   **Advanced Equipment Library:** A comprehensive library of specific ride models with accurate dimensions and safety clearances.
*   **Customizable Equipment:** Ability for users to define and save custom equipment types with specific dimensions and properties.
*   **Safety Zone Visualization:** Overlay safety zones and pathways to ensure compliance with regulations.
*   **Traffic Flow Analysis:** Tools to simulate and analyze pedestrian traffic flow within the planned layout.
*   **Multi-User Collaboration:** Allow multiple users to collaborate on a single layout in real-time.
*   **Reporting and Export:** Generate reports (e.g., equipment lists, area utilization) and export layouts to various formats (PDF, image).
*   **Integration with Mapping Services:** Import real-world fairground maps or satellite imagery as a base layer.
*   **Financial Projections:** Integrate with financial data to estimate revenue potential based on layout efficiency.
*   **Offline Synchronization with Cloud Backend:** Implement robust offline-first architecture with cloud synchronization (e.g., Supabase, Firebase) for seamless data management across devices.
*   **Mobile Application (Native/Hybrid):** Develop dedicated mobile applications for iOS and Android using Capacitor or similar technologies for on-site use.
*   **AI-Powered Layout Suggestions:** Leverage AI to suggest optimal layouts based on various parameters (e.g., crowd flow, equipment type, safety).

## 7. Technical Architecture

The Carnival Lot Planner application will follow a modern web application architecture. The frontend will be built using a reactive JavaScript framework, providing an interactive and responsive user experience. Data persistence for MVP will be client-side, with a clear roadmap for cloud integration.

### 7.1. Frontend Technologies

*   **React (or similar framework like Vue/Angular):** For building the user interface components.
*   **Konva.js (or similar canvas library like Fabric.js, Pixi.js):** For creating and managing the interactive drawing canvas.
*   **HTML5 Canvas API:** The underlying technology for rendering graphics.
*   **CSS-in-JS or SASS/LESS:** For styling and responsive design.

### 7.2. Backend Technologies (Future Consideration)

*   **Supabase/Firebase (or custom Node.js/Python backend):** For cloud-based data storage, user authentication, and real-time features in future phases.
*   **PostgreSQL (or other relational/NoSQL database):** For storing project data, equipment libraries, and user information.

### 7.3. Mobile Integration (Future Consideration)

*   **Capacitor/React Native:** For wrapping the web application into native iOS and Android applications, enabling access to device-specific features.

## 8. User Interface (UI) / User Experience (UX) Considerations

*   **Intuitive Layout Tools:** Easy-to-use tools for drawing, placing, and manipulating equipment.
*   **Clear Visual Feedback:** Immediate visual cues for actions like dragging, resizing, and collision detection.
*   **Responsive Design:** The interface should adapt seamlessly to various screen sizes, from desktop monitors to tablets.
*   **Accessibility:** Adherence to accessibility guidelines to ensure usability for all users.
*   **Undo/Redo Functionality:** Standard undo/redo history for user actions.
*   **Layering:** Ability to manage different layers of the layout (e.g., base map, equipment, safety zones).

## 9. Performance Requirements

*   **Smooth Canvas Interaction:** The canvas should remain highly responsive during complex operations, even with a large number of elements.
*   **Fast Loading Times:** The application should load quickly, especially for users with limited internet access.
*   **Efficient Resource Usage:** Optimized to minimize CPU and memory consumption, particularly on mobile devices.

## 10. Security Considerations

*   **Data Integrity:** Ensure the integrity of saved layouts and equipment data.
*   **Access Control (Future):** Implement user authentication and authorization when cloud storage is introduced.
*   **Input Validation:** Validate all user inputs to prevent malicious data or errors.

## 11. Analytics and Monitoring

*   **Usage Tracking:** Track key user interactions and feature adoption to inform future development.
*   **Error Logging:** Implement error logging to identify and resolve issues promptly.

## 12. Testing Strategy

*   **Unit Testing:** For individual components and utility functions.
*   **Integration Testing:** To ensure seamless interaction between different modules.
*   **User Acceptance Testing (UAT):** Involve carnival lot managers in testing to validate the application meets their real-world needs.
*   **Performance Testing:** To ensure the application meets responsiveness and loading time requirements.

## 13. Deployment and Maintenance

*   **Web Deployment:** Initial deployment as a web application, accessible via a browser.
*   **Version Control:** Use Git for source code management.
*   **Regular Updates:** Plan for continuous updates and bug fixes based on user feedback and evolving requirements.

## 14. Appendix

### 14.1. References

*   [1] OnePlan Event Mapping Software: `https://www.oneplan.io/`
*   [2] Icograms Designer: `https://icograms.com/`
*   [3] Konva.js Documentation: `https://konvajs.org/`
*   [4] React Documentation: `https://react.dev/`
*   [5] HTML5 Canvas API: `https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API`
*   [6] localStorage API: `https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#localStorage`

### 14.2. Glossary

*   **PRD:** Product Requirements Document
*   **MVP:** Minimum Viable Product
*   **UI:** User Interface
*   **UX:** User Experience
*   **API:** Application Programming Interface
*   **Konva.js:** An HTML5 Canvas JavaScript framework for desktop and mobile applications.
*   **Capacitor:** An open-source native runtime for building web apps that run on iOS, Android, Electron, and the web (future consideration).
*   **Supabase:** An open-source Firebase alternative providing database, authentication, and storage services (future consideration).
*   **IndexedDB:** A low-level API for client-side storage of significant amounts of structured data, including files/blobs (future consideration).
*   **Fairground:** The area where a fair or carnival is held.
*   **Ride Equipment:** The various amusement rides, such as roller coasters, carousels, and Ferris wheels.
*   **Lot Manager:** The person responsible for planning and overseeing the layout of a fairground.


