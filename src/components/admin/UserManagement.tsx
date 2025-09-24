import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, Shield, User, Crown } from "lucide-react";

interface UserData {
  user_id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at: string;
  business_count: number;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<'admin' | 'business_owner'>('business_owner');
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get user roles with business count
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          created_at
        `);

      if (rolesError) throw rolesError;

      // Get business count for each user
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('owner_id');

      if (businessError) throw businessError;

      // Count businesses per user
      const businessCount = businessData.reduce((acc: Record<string, number>, business) => {
        acc[business.owner_id] = (acc[business.owner_id] || 0) + 1;
        return acc;
      }, {});

      // For demo purposes, we'll create mock user data since we can't access auth.users directly
      const usersWithRoles = userRoles?.map((userRole) => ({
        user_id: userRole.user_id,
        email: `user-${userRole.user_id.slice(-8)}@example.com`, // Mock email
        role: userRole.role,
        created_at: userRole.created_at,
        last_sign_in_at: new Date().toISOString(), // Mock last sign in
        business_count: businessCount[userRole.user_id] || 0
      })) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: 'admin' | 'business_owner') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });

      fetchUsers();
      setIsRoleDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          Manage platform users and their roles
        </CardDescription>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by email or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Businesses</TableHead>
              <TableHead>Member Since</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell className="font-mono text-xs">
                  {user.user_id.slice(0, 8)}...
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="gap-1">
                    {getRoleIcon(user.role)}
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {user.business_count} business{user.business_count !== 1 ? 'es' : ''}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(user.last_sign_in_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Dialog open={isRoleDialogOpen && selectedUserId === user.user_id} onOpenChange={setIsRoleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUserId(user.user_id);
                          setSelectedRole(user.role as 'admin' | 'business_owner');
                        }}
                      >
                        Change Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>
                          Select a new role for this user. This will affect their permissions across the platform.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Current Role: {user.role}</label>
                        </div>
                        <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'admin' | 'business_owner')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select new role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="business_owner">Business Owner</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsRoleDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => updateUserRole(user.user_id, selectedRole)}
                            disabled={selectedRole === user.role}
                          >
                            Update Role
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserManagement;