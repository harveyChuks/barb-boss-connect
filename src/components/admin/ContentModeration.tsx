import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Flag, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Search,
  Filter,
  Shield,
  MessageSquare,
  Image,
  User,
  Building
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ContentReport {
  id: string;
  reporter_email: string;
  reported_content_type: 'business' | 'review' | 'profile' | 'image';
  reported_content_id: string;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'false_info' | 'copyright' | 'other';
  description: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewer_id?: string;
  content_preview: string;
}

interface ModerationRule {
  id: string;
  name: string;
  type: 'banned_words' | 'auto_flag' | 'content_filter';
  pattern: string;
  action: 'flag' | 'block' | 'hide';
  is_active: boolean;
  created_at: string;
}

interface FlaggedContent {
  id: string;
  content_type: 'business_description' | 'review_text' | 'profile_bio';
  content_id: string;
  content_preview: string;
  business_name?: string;
  user_email?: string;
  flagged_reason: string;
  auto_flagged: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  created_at: string;
}

export const ContentModeration = () => {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [moderationRules, setModerationRules] = useState<ModerationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newRule, setNewRule] = useState({
    name: '',
    type: 'banned_words' as const,
    pattern: '',
    action: 'flag' as const
  });

  useEffect(() => {
    fetchModerationData();
  }, []);

  const fetchModerationData = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would come from moderation tables
      const mockReports: ContentReport[] = [
        {
          id: '1',
          reporter_email: 'user@example.com',
          reported_content_type: 'business',
          reported_content_id: 'biz-123',
          reason: 'inappropriate',
          description: 'Business profile contains inappropriate images',
          status: 'pending',
          created_at: new Date().toISOString(),
          content_preview: 'Hair Salon with inappropriate content...'
        },
        {
          id: '2',
          reporter_email: 'customer@test.com',
          reported_content_type: 'review',
          reported_content_id: 'rev-456',
          reason: 'spam',
          description: 'Fake review with promotional content',
          status: 'reviewing',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          content_preview: 'Amazing service! Visit our website for discount...'
        }
      ];

      const mockFlaggedContent: FlaggedContent[] = [
        {
          id: '1',
          content_type: 'business_description',
          content_id: 'biz-789',
          content_preview: 'Best salon in town with guaranteed results or money back...',
          business_name: 'Premium Hair Studio',
          flagged_reason: 'Contains banned phrase: "guaranteed results"',
          auto_flagged: true,
          status: 'pending',
          created_at: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: '2',
          content_type: 'review_text',
          content_id: 'rev-101',
          content_preview: 'Terrible service, worst experience ever, avoid at all costs...',
          user_email: 'angry@customer.com',
          flagged_reason: 'Potential harassment language detected',
          auto_flagged: true,
          status: 'pending',
          created_at: new Date(Date.now() - 7200000).toISOString()
        }
      ];

      const mockRules: ModerationRule[] = [
        {
          id: '1',
          name: 'Banned Words Filter',
          type: 'banned_words',
          pattern: 'spam,scam,fake,guaranteed,money back',
          action: 'flag',
          is_active: true,
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '2',
          name: 'Harassment Detection',
          type: 'content_filter',
          pattern: 'terrible|worst|awful|hate',
          action: 'flag',
          is_active: true,
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ];

      setReports(mockReports);
      setFlaggedContent(mockFlaggedContent);
      setModerationRules(mockRules);

    } catch (error) {
      console.error('Error fetching moderation data:', error);
      toast({
        title: "Error",
        description: "Failed to load moderation data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'approve' | 'reject') => {
    try {
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              status: action === 'approve' ? 'approved' : 'rejected',
              reviewed_at: new Date().toISOString(),
              reviewer_id: 'current-admin'
            }
          : report
      ));
      
      toast({
        title: "Success",
        description: `Report ${action}d successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} report`,
        variant: "destructive"
      });
    }
  };

  const handleContentAction = async (contentId: string, action: 'approve' | 'hide' | 'reject') => {
    try {
      setFlaggedContent(prev => prev.map(content => 
        content.id === contentId 
          ? { ...content, status: action === 'approve' ? 'approved' : action === 'hide' ? 'hidden' : 'rejected' }
          : content
      ));
      
      toast({
        title: "Success",
        description: `Content ${action}d successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} content`,
        variant: "destructive"
      });
    }
  };

  const createModerationRule = async () => {
    try {
      if (!newRule.name || !newRule.pattern) {
        toast({
          title: "Error",
          description: "Please fill in all rule fields",
          variant: "destructive"
        });
        return;
      }

      const rule: ModerationRule = {
        id: Date.now().toString(),
        ...newRule,
        is_active: true,
        created_at: new Date().toISOString()
      };

      setModerationRules(prev => [rule, ...prev]);
      setNewRule({ name: '', type: 'banned_words', pattern: '', action: 'flag' });
      
      toast({
        title: "Success",
        description: "Moderation rule created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create moderation rule",
        variant: "destructive"
      });
    }
  };

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      setModerationRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, is_active: isActive } : rule
      ));
      
      toast({
        title: "Success",
        description: `Rule ${isActive ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rule status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'hidden':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'business':
        return <Building className="h-4 w-4" />;
      case 'review':
        return <MessageSquare className="h-4 w-4" />;
      case 'profile':
        return <User className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      default:
        return <Flag className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading moderation data...</div>;
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.content_preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reporter_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredContent = flaggedContent.filter(content => {
    const matchesSearch = content.content_preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || content.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Content Moderation</h2>
          <p className="text-muted-foreground">Review and moderate platform content</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            {reports.filter(r => r.status === 'pending').length} Pending Reports
          </Badge>
        </div>
      </div>

      {/* Moderation Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {reports.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {flaggedContent.filter(c => c.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {moderationRules.filter(r => r.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Flagged Today</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flaggedContent.filter(c => c.auto_flagged).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports and content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">User Reports</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Content</TabsTrigger>
          <TabsTrigger value="rules">Moderation Rules</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>Review content reported by users</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Content Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Content Preview</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.reporter_email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getContentTypeIcon(report.reported_content_type)}
                          <span className="capitalize">{report.reported_content_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {report.reason.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {report.content_preview}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(report.status) as any}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {report.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReportAction(report.id, 'approve')}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReportAction(report.id, 'reject')}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Content</CardTitle>
              <CardDescription>Content automatically flagged by moderation rules</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Content Preview</TableHead>
                    <TableHead>Flagged Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContent.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {content.content_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {content.business_name || content.user_email || 'Unknown'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {content.content_preview}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {content.flagged_reason}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(content.status) as any}>
                          {content.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(content.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {content.status === 'pending' && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleContentAction(content.id, 'approve')}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleContentAction(content.id, 'hide')}
                            >
                              <EyeOff className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleContentAction(content.id, 'reject')}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Create Moderation Rule</CardTitle>
                <CardDescription>Set up automated content moderation rules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rule_name">Rule Name</Label>
                  <Input
                    id="rule_name"
                    value={newRule.name}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Spam Filter"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule_type">Rule Type</Label>
                  <Select
                    value={newRule.type}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banned_words">Banned Words</SelectItem>
                      <SelectItem value="auto_flag">Auto Flag</SelectItem>
                      <SelectItem value="content_filter">Content Filter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule_pattern">Pattern/Keywords</Label>
                  <Textarea
                    id="rule_pattern"
                    value={newRule.pattern}
                    onChange={(e) => setNewRule(prev => ({ ...prev, pattern: e.target.value }))}
                    placeholder="Enter keywords separated by commas or regex pattern"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule_action">Action</Label>
                  <Select
                    value={newRule.action}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, action: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flag">Flag for Review</SelectItem>
                      <SelectItem value="block">Block Content</SelectItem>
                      <SelectItem value="hide">Hide Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createModerationRule} className="w-full">
                  Create Rule
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Moderation Rules</CardTitle>
                <CardDescription>Manage existing moderation rules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moderationRules.map((rule) => (
                    <div key={rule.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{rule.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {rule.type.replace('_', ' ')}
                          </Badge>
                          <Switch
                            checked={rule.is_active}
                            onCheckedChange={(checked) => toggleRuleStatus(rule.id, checked)}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Action: <span className="capitalize">{rule.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Pattern: {rule.pattern}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Settings</CardTitle>
              <CardDescription>Configure global moderation preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-approve low risk content</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve content with low risk scores</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email notifications for flagged content</Label>
                  <p className="text-sm text-muted-foreground">Send email alerts when content is flagged</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Strict mode</Label>
                  <p className="text-sm text-muted-foreground">Apply stricter moderation rules</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};