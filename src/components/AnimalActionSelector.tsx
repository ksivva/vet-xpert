
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Animal } from '../types';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Hospital, Trash2, CircleX } from 'lucide-react';

interface AnimalActionSelectorProps {
  animal: Animal;
  isOpen: boolean;
  onClose: () => void;
}

const AnimalActionSelector: React.FC<AnimalActionSelectorProps> = ({ 
  animal,
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();

  const handleTreatAction = () => {
    onClose();
    navigate(`/treatment/${animal.id}`);
  };

  const handleDeadAction = () => {
    // For now, just show a toast message as this screen is not implemented yet
    onClose();
    console.log('Navigate to dead screen', animal.id);
    alert('Dead screen not yet implemented');
  };

  const handleRealizeAction = () => {
    // For now, just show a toast message as this screen is not implemented yet
    onClose();
    console.log('Navigate to realize screen', animal.id);
    alert('Realize screen not yet implemented');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Animal Action - {animal.visualTag}</AlertDialogTitle>
          <AlertDialogDescription>
            Select an action to perform on this animal:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          <Button 
            onClick={handleTreatAction} 
            className="flex justify-start items-center space-x-2 h-16"
          >
            <Hospital className="h-6 w-6" />
            <div className="text-left">
              <div className="font-medium">TREAT</div>
              <div className="text-xs text-muted-foreground">Administer treatment to the animal</div>
            </div>
          </Button>
          <Button 
            onClick={handleDeadAction} 
            variant="outline"
            className="flex justify-start items-center space-x-2 h-16"
          >
            <Trash2 className="h-6 w-6" />
            <div className="text-left">
              <div className="font-medium">DEAD</div>
              <div className="text-xs text-muted-foreground">Record animal death and reason</div>
            </div>
          </Button>
          <Button 
            onClick={handleRealizeAction} 
            variant="outline"
            className="flex justify-start items-center space-x-2 h-16"
          >
            <CircleX className="h-6 w-6" />
            <div className="text-left">
              <div className="font-medium">REALIZE</div>
              <div className="text-xs text-muted-foreground">Animal to be sent to junk yard</div>
            </div>
          </Button>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AnimalActionSelector;
