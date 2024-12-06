import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  InputAdornment,
  AppBar,
  Grid,
  Toolbar,
  CssBaseline,
  Card,
  CardContent,
  Link as LinkIcon
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Search as SearchIcon,
  Upload as UploadIcon,
  RestartAlt as RestartAltIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { ThemeProvider, createTheme } from '@mui/material/styles';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const API_URL = 'http://localhost:8000';

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [project, setProject] = useState({
    name: '',
    id: '',
    description: '',
    owner: '',
    ownerContact: '',
    design_review_link: '',
    venrisk_ticket: '',
    threat_model_owner: '',
  });
  const [components, setComponents] = useState<any[]>([]);
  const [diagrams, setDiagrams] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [newDiagram, setNewDiagram] = useState({
    name: '',
    url: '',
    description: ''
  });

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      background: {
        default: darkMode ? '#121212' : '#ffffff',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: darkMode ? '#121212' : '#ffffff',
            margin: 0,
            padding: 0,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: 'none',
          },
        },
      },
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Form states
  const [newComponent, setNewComponent] = useState({
    name: '',
    id: '',
    description: '',
    component_link: '',
    type: 'service',
    assets: [],
    subComponents: [],
    threats: [],
  });
  const [newAsset, setNewAsset] = useState({
    name: '',
    description: '',
    attributes: {}
  });
  const [newThreat, setNewThreat] = useState({
    name: '',
    description: '',
    categories: [],
    mitigation: {
      name: '',
      description: ''
    },
    attributes: {}
  });
  const [newMitigation, setNewMitigation] = useState({
    name: '',
    description: '',
    status: 'Not Started',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedThreat, setExpandedThreat] = useState<string | false>(false);

  const filterThreats = (threats: any[]) => {
    return threats.filter(
      (threat) =>
        threat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        threat.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  useEffect(() => {
    fetchModel();
    fetchDiagrams();
  }, []);

  const fetchModel = async () => {
    try {
      console.log('Fetching model...');
      const response = await axios.get(`${API_URL}/model`);
      console.log('Model response:', response.data);
      
      setProject(response.data.project);
      setComponents(response.data.components || []);
      setDiagrams(response.data.diagrams || []);
      console.log('Model state updated');
    } catch (error) {
      console.error('Error fetching model:', error);
    }
  };

  const fetchDiagrams = async () => {
    try {
      const response = await axios.get(`${API_URL}/diagrams`);
      setDiagrams(response.data);
    } catch (error) {
      console.error('Error fetching diagrams:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/project`, project);
      fetchModel();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleComponentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/components`, newComponent);
      setNewComponent({
        name: '',
        id: '',
        description: '',
        component_link: '',
        type: 'service',
        assets: [],
        subComponents: [],
        threats: [],
      });
      fetchModel();
    } catch (error) {
      console.error('Error creating component:', error);
    }
  };

  const handleAssetSubmit = async (componentId: string, e: React.FormEvent) => {
    e.preventDefault();
    try {
      const asset = {
        name: newAsset.name,
        description: newAsset.description,
        attributes: {}
      };
      
      // First add the asset to the global assets list
      const assetResponse = await axios.post(`${API_URL}/assets`, asset);
      const createdAsset = assetResponse.data;

      // Then associate it with the component
      await axios.post(`${API_URL}/components/${componentId}/assets/${createdAsset.id}`);
      
      setNewAsset({
        name: '',
        description: '',
        attributes: {}
      });
      
      fetchModel();
    } catch (error) {
      console.error('Error creating asset:', error);
    }
  };

  const handleThreatSubmit = async (componentId: string, e: React.FormEvent) => {
    e.preventDefault();
    try {
      const threat = {
        name: newThreat.name,
        description: newThreat.description,
        categories: newThreat.categories,
        mitigation: newThreat.mitigation,
        attributes: {}
      };

      await axios.post(`${API_URL}/components/${componentId}/threats`, threat);
      
      setNewThreat({
        name: '',
        description: '',
        categories: [],
        mitigation: {
          name: '',
          description: ''
        },
        attributes: {}
      });
      
      fetchModel();
    } catch (error) {
      console.error('Error creating threat:', error);
    }
  };

  const handleMitigationSubmit = async (componentId: string, threatId: string, e: React.FormEvent) => {
    e.preventDefault();
    try {
      const mitigation = {
        name: newMitigation.name,
        description: newMitigation.description,
        status: newMitigation.status,
      };
      
      // Update the threat with the new mitigation
      const component = components.find(c => c.id === componentId);
      if (!component) return;
      
      const threat = component.threats.find((t: any) => t.id === threatId);
      if (!threat) return;
      
      const updatedThreat = {
        ...threat,
        mitigation
      };
      
      await axios.post(`${API_URL}/components/${componentId}/threats`, updatedThreat);
      
      fetchModel();
      setNewMitigation({
        name: '',
        description: '',
        status: 'Not Started',
      });
    } catch (error) {
      console.error('Error adding mitigation:', error);
    }
  };

  const handleDeleteComponent = async (componentId: string) => {
    try {
      await axios.delete(`${API_URL}/components/${componentId}`);
      fetchModel();
    } catch (error) {
      console.error('Error deleting component:', error);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await axios.delete(`${API_URL}/assets/${assetId}`);
      fetchModel();
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const handleDeleteThreat = async (componentId: string, threatId: string) => {
    try {
      await axios.delete(`${API_URL}/components/${componentId}/threats/${threatId}`);
      fetchModel();
    } catch (error) {
      console.error('Error deleting threat:', error);
    }
  };

  const handleDeleteMitigation = async (componentId: string, threatId: string) => {
    try {
      await axios.delete(`${API_URL}/components/${componentId}/threats/${threatId}/mitigation`);
      fetchModel();
    } catch (error) {
      console.error('Error deleting mitigation:', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_URL}/export/yaml`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/x-yaml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'threat-model.yaml');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting YAML:', error);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      console.log('No file selected');
      return;
    }
    
    const file = event.target.files[0];
    console.log('File selected:', file.name);
    
    try {
      // Read the file content
      const fileContent = await file.text();
      console.log('File content read, length:', fileContent.length);
      
      // Create form data
      const formData = new FormData();
      const blob = new Blob([fileContent], { type: 'application/x-yaml' });
      formData.append('file', blob, file.name);
      
      console.log('Sending request to import YAML...');
      const response = await axios.post(`${API_URL}/import/yaml`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Import response:', response.data);
      await fetchModel();
      console.log('Model refreshed');
    } catch (error) {
      console.error('Error importing YAML:', error);
      alert('Error importing YAML file. Please check the console for details.');
    }
  };

  const handleDiagramAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDiagram.name || !newDiagram.url) {
      alert("Name and URL are required!");
      return;
    }

    const payload = {
      name: newDiagram.name.trim(),
      url: newDiagram.url.trim(),
      ...(newDiagram.description && { description: newDiagram.description.trim() })
    };

    console.log('Sending diagram payload:', payload);

    try {
      const response = await axios.post(`${API_URL}/diagrams`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Diagram response:', response.data);
      
      // Reset form
      setNewDiagram({
        name: '',
        url: '',
        description: ''
      });
      
      // Refresh diagrams list
      const diagramsResponse = await axios.get(`${API_URL}/diagrams`);
      setDiagrams(diagramsResponse.data);
    } catch (error: any) {
      console.error('Error adding diagram:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to add diagram. Please check your inputs and try again.';
      alert(errorMessage);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      try {
        await axios.post(`${API_URL}/reset`);
        fetchModel();
      } catch (error) {
        console.error('Error resetting model:', error);
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        bgcolor: 'background.default',
        margin: 0,
        padding: 0,
      }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Rapid Risk Tool
            </Typography>
            <IconButton 
              color="inherit" 
              onClick={toggleDarkMode}
              sx={{ mr: 2 }}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Button
              variant="contained"
              onClick={handleExport}
              startIcon={<DownloadIcon />}
              sx={{ 
                mr: 1,
                bgcolor: 'background.paper',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'background.default',
                }
              }}
            >
              EXPORT YAML
            </Button>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadIcon />}
              sx={{ 
                bgcolor: 'background.paper',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'background.default',
                }
              }}
            >
              IMPORT YAML
              <input
                type="file"
                hidden
                accept=".yaml,.yml"
                onChange={handleImport}
              />
            </Button>
          </Toolbar>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered 
            indicatorColor="secondary"
            textColor="inherit"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#FF8C00',
              },
              '& .MuiTab-root': {
                color: 'inherit',
                '&.Mui-selected': {
                  color: 'inherit',
                },
              },
            }}
          >
            <Tab label="Project" />
            <Tab label="Components" />
            <Tab label="Data Flow / Architecture Diagrams" />
            <Tab label="Glossary" />
          </Tabs>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Project Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <form onSubmit={handleProjectSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Project Name"
                          value={project.name}
                          onChange={(e) => setProject({ ...project, name: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          multiline
                          rows={4}
                          value={project.description}
                          onChange={(e) => setProject({ ...project, description: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Project Owner"
                          value={project.owner}
                          onChange={(e) => setProject({ ...project, owner: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Owner Contact"
                          value={project.ownerContact}
                          onChange={(e) => setProject({ ...project, ownerContact: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Design Review Document Link"
                          value={project.design_review_link}
                          onChange={(e) => setProject({ ...project, design_review_link: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="VENRISK Ticket"
                          value={project.venrisk_ticket}
                          onChange={(e) => setProject({ ...project, venrisk_ticket: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Threat Model Owner"
                          value={project.threat_model_owner}
                          onChange={(e) => setProject({ ...project, threat_model_owner: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 2 }}>
                          <Button type="submit" variant="contained" color="primary">
                            Update Project
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={handleReset}
                            startIcon={<RestartAltIcon />}
                          >
                            Reset Project
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </form>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Add Component
                  </Typography>
                  <form onSubmit={handleComponentSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Component Name"
                          value={newComponent.name}
                          onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Component Link (Optional)"
                          value={newComponent.component_link}
                          onChange={(e) => setNewComponent({ ...newComponent, component_link: e.target.value })}
                          placeholder="https://..."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          value={newComponent.description}
                          onChange={(e) => setNewComponent({ ...newComponent, description: e.target.value })}
                          multiline
                          rows={4}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                          Add Component
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Components
                  </Typography>
                  {components.map((component) => (
                    <Box key={component.id} sx={{ mb: 4 }}>
                      <Paper elevation={2} sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6" gutterBottom>
                            {component.name}
                          </Typography>
                          <IconButton 
                            onClick={() => handleDeleteComponent(component.id)}
                            size="small"
                            color="error"
                            title="Delete Component"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          {component.description}
                        </Typography>
                        {component.component_link && (
                          <Box sx={{ mt: 1 }}>
                            <a href={component.component_link} target="_blank" rel="noopener noreferrer">
                              <Button variant="outlined" size="small" startIcon={<LinkIcon />}>
                                Component Details
                              </Button>
                            </a>
                          </Box>
                        )}
                        {/* Assets Section */}
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1">Assets:</Typography>
                          <form onSubmit={(e) => handleAssetSubmit(component.id, e)}>
                            <TextField
                              fullWidth
                              label="Asset Name"
                              value={newAsset.name}
                              onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                              margin="normal"
                              required
                            />
                            <TextField
                              fullWidth
                              label="Asset Description"
                              value={newAsset.description}
                              onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                              margin="normal"
                              multiline
                              rows={2}
                              required
                            />
                            <Button type="submit" variant="contained" size="small" sx={{ mt: 1 }}>
                              Add Asset
                            </Button>
                          </form>
                          
                          {/* Assets List */}
                          {component.assets?.map((asset: any) => (
                            <Paper key={asset.id} sx={{ p: 1, mb: 1, bgcolor: 'background.default' }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body1">{asset.name}</Typography>
                                <IconButton
                                  onClick={() => handleDeleteAsset(asset.id)}
                                  size="small"
                                  color="error"
                                  title="Delete Asset"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {asset.description}
                              </Typography>
                            </Paper>
                          ))}
                        </Box>

                        {/* Threats Section */}
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle1">Threats:</Typography>
                          <form onSubmit={(e) => handleThreatSubmit(component.id, e)}>
                            <TextField
                              fullWidth
                              label="Threat Name"
                              value={newThreat.name}
                              onChange={(e) => setNewThreat({ ...newThreat, name: e.target.value })}
                              margin="normal"
                              required
                            />
                            <TextField
                              fullWidth
                              label="Threat Description"
                              value={newThreat.description}
                              onChange={(e) => setNewThreat({ ...newThreat, description: e.target.value })}
                              margin="normal"
                              multiline
                              rows={2}
                              required
                            />
                            <TextField
                              fullWidth
                              label="Mitigation Name"
                              value={newThreat.mitigation.name}
                              onChange={(e) => setNewThreat({
                                ...newThreat,
                                mitigation: { ...newThreat.mitigation, name: e.target.value }
                              })}
                              margin="normal"
                            />
                            <TextField
                              fullWidth
                              label="Mitigation Description"
                              value={newThreat.mitigation.description}
                              onChange={(e) => setNewThreat({
                                ...newThreat,
                                mitigation: { ...newThreat.mitigation, description: e.target.value }
                              })}
                              margin="normal"
                              multiline
                              rows={2}
                            />
                            <Button type="submit" variant="contained" size="small" sx={{ mt: 1 }}>
                              Add Threat
                            </Button>
                          </form>

                          {/* Threats List */}
                          {component.threats?.map((threat: any) => (
                            <Paper key={threat.id} sx={{ p: 1, mb: 1, bgcolor: 'background.default' }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body1">{threat.name}</Typography>
                                <IconButton
                                  onClick={() => handleDeleteThreat(component.id, threat.id)}
                                  size="small"
                                  color="error"
                                  title="Delete Threat"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {threat.description}
                              </Typography>
                              {threat.mitigation && (
                                <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">
                                      Mitigation: {threat.mitigation.name}
                                    </Typography>
                                    <IconButton
                                      onClick={() => handleDeleteMitigation(component.id, threat.id)}
                                      size="small"
                                      color="error"
                                      title="Delete Mitigation"
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {threat.mitigation.description}
                                  </Typography>
                                </Box>
                              )}
                            </Paper>
                          ))}
                        </Box>
                      </Paper>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Data Flow / Architecture Diagrams
              </Typography>
              <Paper sx={{ p: 2, mb: 3 }}>
                <form onSubmit={handleDiagramAdd}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Diagram Name"
                        value={newDiagram.name}
                        onChange={(e) => setNewDiagram({ ...newDiagram, name: e.target.value })}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Diagram URL"
                        value={newDiagram.url}
                        onChange={(e) => setNewDiagram({ ...newDiagram, url: e.target.value })}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Description (Optional)"
                        value={newDiagram.description}
                        onChange={(e) => setNewDiagram({ ...newDiagram, description: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        Add Diagram
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>

              <Typography variant="h6" gutterBottom>
                Existing Diagrams
              </Typography>
              <Grid container spacing={2}>
                {diagrams.map((diagram) => (
                  <Grid item xs={12} key={diagram.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{diagram.name}</Typography>
                        {diagram.attributes?.description && (
                          <Typography color="textSecondary">
                            {diagram.attributes.description}
                          </Typography>
                        )}
                        <Box sx={{ mt: 2 }}>
                          <a href={diagram.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outlined" color="primary">
                              View Diagram
                            </Button>
                          </a>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Glossary
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Component"
                    secondary="A part of the system being modeled, which can have threats and mitigations."
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Asset"
                    secondary="An item of value within a component, which may be subject to threats."
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Threat"
                    secondary="A potential negative action or event facilitated by a vulnerability that results in damage to an asset."
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Mitigation"
                    secondary="A measure taken to reduce the impact or likelihood of a threat."
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Data Flow"
                    secondary="The movement of data between components, which can be analyzed for potential threats."
                  />
                </ListItem>
              </List>
            </Paper>
          </TabPanel>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
