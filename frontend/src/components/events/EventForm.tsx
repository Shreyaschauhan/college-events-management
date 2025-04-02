
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CalendarIcon, Clock, Image as ImageIcon } from 'lucide-react';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Event, EventCategory } from '@/lib/types';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Event name must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  category: z.enum(['Sports', 'Cultural', 'Technical']),
  date: z.date({
    required_error: 'Event date is required',
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:MM format',
  }),
  registrationDeadline: z.date({
    required_error: 'Registration deadline is required',
  }),
  registrationTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:MM format',
  }),
  venue: z.string().min(3, { message: 'Venue must be at least 3 characters' }),
  maxParticipants: z.coerce.number().int().positive().min(1, {
    message: 'Number of participants must be at least 1',
  }),
  eventImage: z.instanceof(File, { message: 'Event image is required' }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type EventFormProps = {
  onSubmit: (data: any) => void;
  event?: Event;
  isLoading?: boolean;
};

const EventForm = ({ onSubmit, event, isLoading = false }: EventFormProps) => {
  // Set default form values
  const defaultValues = event
    ? {
        name: event.name,
        description: event.description,
        category: event.category,
        date: new Date(event.date),
        time: format(new Date(event.date), 'HH:mm'),
        registrationDeadline: new Date(event.registrationDeadline),
        registrationTime: format(new Date(event.registrationDeadline), 'HH:mm'),
        venue: event.venue,
        maxParticipants: event.maxParticipants,
        eventImage: undefined,
      }
    : {
        name: '',
        description: '',
        category: 'Technical' as EventCategory,
        date: new Date(),
        time: '09:00',
        registrationDeadline: new Date(),
        registrationTime: '09:00',
        venue: '',
        maxParticipants: 30,
        eventImage: undefined,
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = (values: FormValues) => {
    // Combine date and time into a single Date object
    const eventDateTime = new Date(values.date);
    const [hours, minutes] = values.time.split(':').map(Number);
    eventDateTime.setHours(hours, minutes);

    const registrationDateTime = new Date(values.registrationDeadline);
    const [regHours, regMinutes] = values.registrationTime.split(':').map(Number);
    registrationDateTime.setHours(regHours, regMinutes);

    // Make sure registration deadline is before the event date
    if (registrationDateTime >= eventDateTime) {
      toast.error('Registration deadline must be before the event date');
      return;
    }

    // Format the data for submission
    const formattedData = {
      ...values,
      date: eventDateTime,
      registrationDeadline: registrationDateTime,
    };

    onSubmit(formattedData);
  };

  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('eventImage', file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card className="border border-blue-100 shadow-md bg-gradient-to-r from-blue-50 to-white">
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="eventImage"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem className="mb-4">
                  <FormLabel>Event Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('eventImage')?.click()}
                          className="relative flex gap-2 py-6 border-dashed border-2"
                        >
                          <ImageIcon className="h-5 w-5" />
                          <span>Upload Image</span>
                          <input
                            id="eventImage"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                            {...fieldProps}
                          />
                        </Button>
                        <div className="text-sm text-muted-foreground">
                          Upload a high-quality image to make your event stand out
                        </div>
                      </div>
                      
                      {imagePreview && (
                        <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-border">
                          <img 
                            src={imagePreview} 
                            alt="Event preview" 
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setImagePreview(null);
                              form.setValue('eventImage', undefined);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter event name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter event description"
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Event Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Time</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        type="time" 
                        placeholder="HH:MM" 
                        {...field} 
                      />
                    </FormControl>
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="registrationDeadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Registration Deadline</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Must be before the event date
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="registrationTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Deadline Time</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        type="time" 
                        placeholder="HH:MM" 
                        {...field} 
                      />
                    </FormControl>
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="venue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Venue</FormLabel>
                <FormControl>
                  <Input placeholder="Enter venue" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxParticipants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Participants</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1}
                    placeholder="Enter maximum number of participants" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 transition-all px-8"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="loader mr-2" />
                <span>{event ? 'Updating...' : 'Creating...'}</span>
              </div>
            ) : (
              <span>{event ? 'Update Event' : 'Create Event'}</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EventForm;
