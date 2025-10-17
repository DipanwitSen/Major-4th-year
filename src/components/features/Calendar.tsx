import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
}

const Calendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
  });

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      toast.error('Please fill all fields');
      return;
    }

    const event: Event = {
      id: Date.now().toString(),
      ...newEvent,
    };

    setEvents([...events, event]);
    setNewEvent({ title: "", date: "", time: "" });
    toast.success('Event added successfully!');
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    toast.success('Event deleted');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <CalendarIcon className="text-primary" size={32} />
          <div>
            <h3 className="text-2xl font-bold">Calendar & Reminders</h3>
            <p className="text-muted-foreground">Manage your events and reminders</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-4">
          <Input
            placeholder="Event title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            className="bg-background/50"
          />
          <Input
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            className="bg-background/50"
          />
          <Input
            type="time"
            value={newEvent.time}
            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
            className="bg-background/50"
          />
        </div>

        <Button
          onClick={handleAddEvent}
          className="w-full bg-gradient-to-r from-primary to-primary-glow"
        >
          <Plus size={18} className="mr-2" />
          Add Event
        </Button>
      </Card>

      <div className="space-y-3">
        {events.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No events scheduled. Add your first event!</p>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="glass-card p-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-lg">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteEvent(event.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Calendar;
