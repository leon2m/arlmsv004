import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Plus } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  level: number;
  skill: Skill;
}

interface EditSkillsProps {
  userSkills: UserSkill[];
  onSkillsUpdate: () => void;
}

export const EditSkills: React.FC<EditSkillsProps> = ({ userSkills, onSkillsUpdate }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [editedSkills, setEditedSkills] = useState<Record<string, number>>({});
  const [selectedSkill, setSelectedSkill] = useState<string>('');

  useEffect(() => {
    // Mevcut becerileri düzenleme state'ine aktar
    const initialSkills: Record<string, number> = {};
    userSkills.forEach(skill => {
      initialSkills[skill.skill_id] = skill.level;
    });
    setEditedSkills(initialSkills);
  }, [userSkills]);

  useEffect(() => {
    // Mevcut olmayan becerileri getir
    const fetchAvailableSkills = async () => {
      try {
        const existingSkillIds = userSkills.map(s => s.skill_id);
        const { data: skills, error } = await supabase
          .from('skills')
          .select('*')
          .not('id', 'in', `(${existingSkillIds.join(',')})`);

        if (error) throw error;
        setAvailableSkills(skills || []);
      } catch (err) {
        console.error('Error fetching available skills:', err);
      }
    };

    if (isOpen) {
      fetchAvailableSkills();
    }
  }, [isOpen, userSkills]);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Mevcut becerileri güncelle
      const updatePromises = userSkills.map(skill => 
        supabase
          .from('user_skills')
          .update({ level: editedSkills[skill.skill_id] })
          .eq('user_id', user.id)
          .eq('skill_id', skill.skill_id)
      );

      // Yeni beceri ekle
      if (selectedSkill) {
        updatePromises.push(
          supabase
            .from('user_skills')
            .insert({
              user_id: user.id,
              skill_id: selectedSkill,
              level: editedSkills[selectedSkill] || 0
            })
        );
      }

      await Promise.all(updatePromises);
      onSkillsUpdate();
      setIsOpen(false);
      setSelectedSkill('');
    } catch (err) {
      console.error('Error updating skills:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="ml-auto"
      >
        <Plus className="h-4 w-4 mr-2" />
        Düzenle
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Beceri Düzeylerini Düzenle</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Mevcut beceriler */}
            {userSkills.map((skill) => (
              <div key={skill.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    {skill.skill.name}
                  </label>
                  <span className="text-sm text-gray-500">
                    {editedSkills[skill.skill_id]}%
                  </span>
                </div>
                <Slider
                  value={[editedSkills[skill.skill_id]]}
                  onValueChange={([value]) => {
                    setEditedSkills(prev => ({
                      ...prev,
                      [skill.skill_id]: value
                    }));
                  }}
                  max={100}
                  step={1}
                />
              </div>
            ))}

            {/* Yeni beceri ekleme */}
            {availableSkills.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <label className="text-sm font-medium">
                  Yeni Beceri Ekle
                </label>
                <select
                  value={selectedSkill}
                  onChange={(e) => {
                    setSelectedSkill(e.target.value);
                    if (e.target.value && !editedSkills[e.target.value]) {
                      setEditedSkills(prev => ({
                        ...prev,
                        [e.target.value]: 0
                      }));
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Beceri seçin...</option>
                  {availableSkills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>

                {selectedSkill && (
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Seviye</span>
                      <span className="text-sm text-gray-500">
                        {editedSkills[selectedSkill]}%
                      </span>
                    </div>
                    <Slider
                      value={[editedSkills[selectedSkill] || 0]}
                      onValueChange={([value]) => {
                        setEditedSkills(prev => ({
                          ...prev,
                          [selectedSkill]: value
                        }));
                      }}
                      max={100}
                      step={1}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kaydet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 