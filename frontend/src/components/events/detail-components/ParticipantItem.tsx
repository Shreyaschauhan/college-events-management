
import React from 'react';
import { Users } from 'lucide-react';
import { User } from '@/lib/types';

type ParticipantItemProps = {
  participant: User;
};

const ParticipantItem = ({ participant }: ParticipantItemProps) => {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-md">
      {participant.profileImage ? (
        <img 
          src={participant.profileImage} 
          alt={participant.name}
          className="h-10 w-10 rounded-full object-cover" 
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="h-5 w-5 text-primary" />
        </div>
      )}
      <div>
        <p className="font-medium">{participant.name}</p>
        <p className="text-sm text-muted-foreground">{participant.email}</p>
      </div>
    </div>
  );
};

export default ParticipantItem;
