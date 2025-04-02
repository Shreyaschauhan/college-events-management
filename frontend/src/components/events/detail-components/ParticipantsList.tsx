
import React from 'react';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ParticipantItem from './ParticipantItem';

type ParticipantsListProps = {
  participants: User[];
  title: string;
};

const ParticipantsList = ({ participants, title }: ParticipantsListProps) => {
  return (
    <div className="bg-card rounded-lg border shadow-sm p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">{title}</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">View All</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Event Participants</DialogTitle>
              <DialogDescription>
                {participants.length} participants enrolled in this event
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto space-y-4 mt-4">
              {participants.map((participant) => (
                <ParticipantItem key={participant.id} participant={participant} />
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {participants.slice(0, 5).map((participant) => (
          <ParticipantItem key={participant.id} participant={participant} />
        ))}
        
        {participants.length > 5 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full">
                View {participants.length - 5} more participants
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Event Participants</DialogTitle>
                <DialogDescription>
                  {participants.length} participants enrolled in this event
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto space-y-4 mt-4">
                {participants.map((participant) => (
                  <ParticipantItem key={participant.id} participant={participant} />
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ParticipantsList;
