import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Plus, Download } from 'lucide-react';

// Initial state for a new component
const initialComponent = {
  id: 1,
  name: '',
  type: 'service',
  description: '',
  parent: '',
  tags: '',
  trustZone: '',
  threats: [{
    id: 'THREAT-1',
    name: '',
    description: '',
    categories: [],
    risk: {
      likelihood: 'MEDIUM',
      impact: 'MEDIUM',
      rating: 'MEDIUM'
    },
    mitigation: {
      state: 'NOT_STARTED',
      decision: 'ACCEPT',
      notes: ''
    }
  }],
  assets: [{
    id: 'ASSET-1',
    name: '',
    description: '',
    risk: {
      confidentiality: 'MEDIUM',
      integrity: 'MEDIUM',
      availability: 'MEDIUM'
    }
  }]
};

const NoteTakingApp = () => {
  const [projectInfo, setProjectInfo] = useState({
    name: '',
    description: '',
    owner: '',
    reviewer: '',
    notes: ''
  });

  const [components, setComponents] = useState([initialComponent]);

  const riskLevels = ['LOW', 'MEDIUM', 'HIGH'];
  const mitigationStates = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
  const mitigationDecisions = ['ACCEPT', 'MITIGATE', 'TRANSFER', 'AVOID'];
  const componentTypes = ['service', 'datastore', 'external_service', 'process'];

  const addComponent = () => {
    setComponents(prev => [
      ...prev,
      {
        ...initialComponent,
        id: prev.length + 1,
        threats: [],
        assets: []
      }
    ]);
  };

  const addThreat = (componentId) => {
    setComponents(components.map(component => {
      if (component.id === componentId) {
        const threats = [...component.threats];
        threats.push({
          id: `THREAT-${threats.length + 1}`,
          name: '',
          description: '',
          categories: [],
          risk: {
            likelihood: 'MEDIUM',
            impact: 'MEDIUM',
            rating: 'MEDIUM'
          },
          mitigation: {
            state: 'NOT_STARTED',
            decision: 'ACCEPT',
            notes: ''
          }
        });
        return { ...component, threats };
      }
      return component;
    }));
  };

  const addAsset = (componentId) => {
    setComponents(components.map(component => {
      if (component.id === componentId) {
        const assets = [...component.assets];
        assets.push({
          id: `ASSET-${assets.length + 1}`,
          name: '',
          description: '',
          risk: {
            confidentiality: 'MEDIUM',
            integrity: 'MEDIUM',
            availability: 'MEDIUM'
          }
        });
        return { ...component, assets };
      }
      return component;
    }));
  };

  const updateComponent = (id, field, value) => {
    setComponents(components.map(component =>
      component.id === id ? { ...component, [field]: value } : component
    ));
  };

  const updateThreat = (componentId, threatId, field, value) => {
    setComponents(components.map(component => {
      if (component.id === componentId) {
        const threats = component.threats.map(threat => {
          if (threat.id === threatId) {
            if (field.includes('.')) {
              const [parent, child] = field.split('.');
              return {
                ...threat,
                [parent]: { ...threat[parent], [child]: value }
              };
            }
            return { ...threat, [field]: value };
          }
          return threat;
        });
        return { ...component, threats };
      }
      return component;
    }));
  };

  const updateAsset = (componentId, assetId, field, value) => {
    setComponents(components.map(component => {
      if (component.id === componentId) {
        const assets = component.assets.map(asset => {
          if (asset.id === assetId) {
            if (field.includes('.')) {
              const [parent, child] = field.split('.');
              return {
                ...asset,
                [parent]: { ...asset[parent], [child]: value }
              };
            }
            return { ...asset, [field]: value };
          }
          return asset;
        });
        return { ...component, assets };
      }
      return component;
    }));
  };

  const generateOTMYaml = () => {
    return `otm:
  version: 0.1.0
  project:
    name: ${projectInfo.name}
    description: ${projectInfo.description}
    owner: ${projectInfo.owner}
    reviewer: ${projectInfo.reviewer}
    notes: ${projectInfo.notes}
    created: ${new Date().toISOString()}
  components:
${components.map(component => `    - id: "COMPONENT-${component.id}"
      name: "${component.name}"
      type: "${component.type}"
      description: "${component.description}"
      parent: "${component.parent}"
      tags: ${component.tags}
      trustZone: "${component.trustZone}"
      threats:
${component.threats.map(threat => `        - id: "${threat.id}"
          name: "${threat.name}"
          description: "${threat.description}"
          categories: ${JSON.stringify(threat.categories)}
          risk:
            likelihood: ${threat.risk.likelihood}
            impact: ${threat.risk.impact}
            rating: ${threat.risk.rating}
          mitigation:
            state: ${threat.mitigation.state}
            decision: ${threat.mitigation.decision}
            notes: "${threat.mitigation.notes}"`).join('\n')}
      assets:
${component.assets.map(asset => `        - id: "${asset.id}"
          name: "${asset.name}"
          description: "${asset.description}"
          risk:
            confidentiality: ${asset.risk.confidentiality}
            integrity: ${asset.risk.integrity}
            availability: ${asset.risk.availability}`).join('\n')}`).join('\n')}`;
  };

  const exportToOTM = () => {
    const yaml = generateOTMYaml();
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'threat-model.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Project Name"
            value={projectInfo.name}
            onChange={(e) => setProjectInfo({ ...projectInfo, name: e.target.value })}
          />
          <Textarea
            placeholder="Project Description"
            value={projectInfo.description}
            onChange={(e) => setProjectInfo({ ...projectInfo, description: e.target.value })}
          />
          <Input
            placeholder="Project Owner"
            value={projectInfo.owner}
            onChange={(e) => setProjectInfo({ ...projectInfo, owner: e.target.value })}
          />
          <Input
            placeholder="Reviewer"
            value={projectInfo.reviewer}
            onChange={(e) => setProjectInfo({ ...projectInfo, reviewer: e.target.value })}
          />
          <Textarea
            placeholder="Project Notes"
            value={projectInfo.notes}
            onChange={(e) => setProjectInfo({ ...projectInfo, notes: e.target.value })}
          />
        </CardContent>
      </Card>

      <div className="flex gap-2 mb-4">
        <Button onClick={addComponent}>
          <Plus className="w-4 h-4 mr-2" />
          Add Component
        </Button>
        <Button onClick={exportToOTM} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export OTM
        </Button>
      </div>

      {components.map((component) => (
        <Card key={component.id} className="mb-4">
          <CardHeader>
            <CardTitle>Component {component.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Component Name"
              value={component.name}
              onChange={(e) => updateComponent(component.id, 'name', e.target.value)}
            />
            <Select
              value={component.type}
              onValueChange={(value) => updateComponent(component.id, 'type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Component Type" />
              </SelectTrigger>
              <SelectContent>
                {componentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Component Description"
              value={component.description}
              onChange={(e) => updateComponent(component.id, 'description', e.target.value)}
            />
            <Input
              placeholder="Parent Component"
              value={component.parent}
              onChange={(e) => updateComponent(component.id, 'parent', e.target.value)}
            />
            <Input
              placeholder="Tags (comma separated)"
              value={component.tags}
              onChange={(e) => updateComponent(component.id, 'tags', e.target.value)}
            />
            <Input
              placeholder="Trust Zone"
              value={component.trustZone}
              onChange={(e) => updateComponent(component.id, 'trustZone', e.target.value)}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NoteTakingApp;