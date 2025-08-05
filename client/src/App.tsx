
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Idea, CreateIdeaInput, UpdateIdeaInput, IdeaCategory } from '../../server/src/schema';

function App() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IdeaCategory | 'all'>('all');
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state for creating new ideas
  const [createFormData, setCreateFormData] = useState<CreateIdeaInput>({
    title: '',
    description: '',
    category: 'Work Related'
  });

  // Form state for editing ideas
  const [editFormData, setEditFormData] = useState<UpdateIdeaInput>({
    id: 0,
    title: '',
    description: '',
    category: 'Work Related'
  });

  const loadIdeas = useCallback(async () => {
    try {
      const filter = selectedCategory === 'all' ? undefined : { category: selectedCategory };
      const result = await trpc.getIdeas.query(filter);
      setIdeas(result);
    } catch (error) {
      console.error('Failed to load ideas:', error);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newIdea = await trpc.createIdea.mutate(createFormData);
      setIdeas((prev: Idea[]) => [newIdea, ...prev]);
      setCreateFormData({
        title: '',
        description: '',
        category: 'Work Related'
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create idea:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIdea) return;
    
    setIsLoading(true);
    try {
      const updatedIdea = await trpc.updateIdea.mutate(editFormData);
      setIdeas((prev: Idea[]) => 
        prev.map((idea: Idea) => idea.id === updatedIdea.id ? updatedIdea : idea)
      );
      setIsEditDialogOpen(false);
      setEditingIdea(null);
    } catch (error) {
      console.error('Failed to update idea:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (ideaId: number) => {
    try {
      await trpc.deleteIdea.mutate({ id: ideaId });
      setIdeas((prev: Idea[]) => prev.filter((idea: Idea) => idea.id !== ideaId));
    } catch (error) {
      console.error('Failed to delete idea:', error);
    }
  };

  const openEditDialog = (idea: Idea) => {
    setEditingIdea(idea);
    setEditFormData({
      id: idea.id,
      title: idea.title,
      description: idea.description,
      category: idea.category
    });
    setIsEditDialogOpen(true);
  };

  const getCategoryColor = (category: IdeaCategory) => {
    switch (category) {
      case 'Work Related':
        return 'bg-blue-100 text-blue-800';
      case 'Hobby':
        return 'bg-green-100 text-green-800';
      case 'To Do':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredIdeas = selectedCategory === 'all' ? ideas : ideas;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">💡 Idea Vault</h1>
          <p className="text-gray-600">Capture, organize, and nurture your brilliant ideas</p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-2">
                ✨ Add New Idea
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Idea</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="What's your idea? 🤔"
                    value={createFormData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCreateFormData((prev: CreateIdeaInput) => ({ ...prev, title: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Tell us more about it..."
                    value={createFormData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setCreateFormData((prev: CreateIdeaInput) => ({ ...prev, description: e.target.value }))
                    }
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <Select 
                    value={createFormData.category} 
                    onValueChange={(value: IdeaCategory) =>
                      setCreateFormData((prev: CreateIdeaInput) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Work Related">💼 Work Related</SelectItem>
                      <SelectItem value="Hobby">🎨 Hobby</SelectItem>
                      <SelectItem value="To Do">📝 To Do</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Creating...' : '🚀 Create Idea'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Filter by:</span>
            <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as IdeaCategory | 'all')}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="Work Related">💼</TabsTrigger>
                <TabsTrigger value="Hobby">🎨</TabsTrigger>
                <TabsTrigger value="To Do">📝</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Ideas Grid */}
        {filteredIdeas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌟</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No ideas yet!</h3>
            <p className="text-gray-500">Start by creating your first brilliant idea above.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredIdeas.map((idea: Idea) => (
              <Card key={idea.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-purple-400">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {idea.title}
                    </CardTitle>
                    <Badge className={`ml-2 ${getCategoryColor(idea.category)} border-0`}>
                      {idea.category === 'Work Related' && '💼'}
                      {idea.category === 'Hobby' && '🎨'}
                      {idea.category === 'To Do' && '📝'}
                      {' '}{idea.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {idea.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Created {idea.created_at.toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(idea)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        ✏️ Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            🗑️ Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Idea</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{idea.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(idea.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Idea</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Idea title"
                  value={editFormData.title || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateIdeaInput) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Textarea
                  placeholder="Idea description"
                  value={editFormData.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setEditFormData((prev: UpdateIdeaInput) => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                  required
                />
              </div>
              <div>
                <Select 
                  value={editFormData.category || 'Work Related'} 
                  onValueChange={(value: IdeaCategory) =>
                    setEditFormData((prev: UpdateIdeaInput) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Work Related">💼 Work Related</SelectItem>
                    <SelectItem value="Hobby">🎨 Hobby</SelectItem>
                    <SelectItem value="To Do">📝 To Do</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Updating...' : '💾 Update Idea'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default App;
