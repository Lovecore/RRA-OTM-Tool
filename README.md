# Rapid Risk Tool

A basic threat modeling tool built on the Open Threat Model (OTM) standard version 0.2.0. This tool will help the Indeed Application Security Team and developers create Rapid Risk Assessments for their projects, while being able to supply an output in the OTM format for furture consumption.

The primary goal of this project is to transform Rapid Risk Assessments (RRAs) into structured, machine-readable code using the OTM schema. By codifying RRAs, we aim to standardize the risk assessment process while maintaining flexibility. We are actively exploring and potentially extending the OTM schema to better accommodate our specific RRA requirements, ensuring that our threat modeling process remains both comprehensive and efficient.

I'm also trying this new hip that that all these cool cats are doing, and using emojis in the readme!

## 🚀 Features

### Core Functionality
- **Project Management**
  - Create and manage threat modeling projects
  - Track project metadata (owner, description, design review links)
  - Support for multiple concurrent projects

### Threat Modeling
- **Component Management**
  - Add and edit system components
  - Define component relationships
  - Track component-specific threats and assets

- **Asset Tracking**
  - Define and manage assets
  - Associate assets with components
  - Track asset risk levels (CIA triad)

- **Threat Assessment**
  - Document threats and vulnerabilities
  - Link threats to components
  - Track threat mitigation status

### Documentation & Visualization
- **Diagram Integration**
  - Link to architecture diagrams
  - Support for multiple diagram types
  - URL-based diagram references

- **YAML Import/Export**
  - Full OTM 0.2.0 specification support
  - Import existing threat models
  - Export models for sharing or version control

### User Interface
- **Modern React Interface**
  - Clean, intuitive design
  - Dark/Light mode support
  - Responsive layout for all screen sizes

## 🛠 Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Development**: Create React App

### Backend
- **Framework**: FastAPI (Python)
- **Data Validation**: Pydantic
- **YAML Processing**: PyYAML
- **Development Server**: Uvicorn

## 🏗 Architecture

The application follows a client-server architecture:

```
Frontend (React/TypeScript)           Backend (FastAPI/Python)
+------------------+                 +------------------+
|                  |   HTTP/REST    |                  |
|  React SPA       | <------------> |  FastAPI Server  |
|  - Components    |      JSON      |  - API Endpoints |
|  - Assets        |                |  - Data Models   |
|  - Threats       |                |  - YAML Handler  |
+------------------+                 +------------------+
```

## 🚦 Getting Started

### Prerequisites
- Python 3.7 or higher
- Node.js and npm
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd rapid-risk-tool
   ```

2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/Scripts/activate  # Windows
   # source venv/bin/activate   # Linux/Mac
   pip install -r requirements.txt
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```
   The application will be available at `http://localhost:3000`

## 📝 Usage Guide

### Creating a New Project
1. Navigate to the Project tab
2. Fill in the project details:
   - Project Name
   - Description
   - Owner Information
   - Design Review Document Link
   - VENRISK Ticket Reference

### Adding Components
1. Go to the Components tab
2. Click "Add Component"
3. Define:
   - Component name
   - Description
   - Associated assets
   - Potential threats

### Managing Diagrams
1. Access the Diagrams tab
2. Add diagrams by providing:
   - Diagram name
   - URL reference
   - Optional description

### Importing/Exporting
- Use the Import button to load existing OTM YAML files
- Use the Export button to save your threat model as OTM YAML

## 🔒 Security Considerations

- The tool is designed for internal network use
- No authentication is currently implemented
- Sensitive data should not be stored in diagram URLs
- Consider network security when deploying

## 🛣 Roadmap

Future improvements planned:
1. Database persistence
2. User authentication
3. Multi-user collaboration features
4. Enhanced diagram integration
5. Custom threat templates
6. Advanced risk scoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built on the [Open Threat Model](https://github.com/iriusrisk/OpenThreatModel) specification
- Uses Material-UI for the interface design
- Inspired by various threat modeling methodologies and tools
