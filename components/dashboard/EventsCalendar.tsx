import React from 'react';
import { Calendar, Video, Users, Award, BookOpen, ExternalLink, MapPin } from 'lucide-react';
import { ITEvent } from '../../types';

interface EventsCalendarProps {
  events: ITEvent[];
  loading?: boolean;
}

const EventsCalendar: React.FC<EventsCalendarProps> = ({ events, loading = false }) => {
  const getEventIcon = (type: ITEvent['type']) => {
    switch (type) {
      case 'webinar': return <Video size={14} className="text-blue-500" />;
      case 'conference': return <Users size={14} className="text-purple-500" />;
      case 'certification_deadline': return <Award size={14} className="text-red-500" />;
      case 'course_launch': return <BookOpen size={14} className="text-green-500" />;
      default: return <Calendar size={14} />;
    }
  };

  const getEventColor = (type: ITEvent['type']) => {
    switch (type) {
      case 'webinar': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'conference': return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'certification_deadline': return 'bg-red-50 border-red-200 text-red-700';
      case 'course_launch': return 'bg-green-50 border-green-200 text-green-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    if (diffDays === 0) return { date: formatted, relative: 'Today', urgent: true };
    if (diffDays === 1) return { date: formatted, relative: 'Tomorrow', urgent: true };
    if (diffDays <= 7) return { date: formatted, relative: `${diffDays} days`, urgent: false };
    return { date: formatted, relative: '', urgent: false };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-blue-500" />
          Upcoming IT Events
        </h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex items-start gap-3">
              <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Calendar size={18} className="text-blue-500" />
          Upcoming IT Events
        </h3>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
        {events.map((event) => {
          const { date, relative, urgent } = formatDate(event.date);
          return (
            <div
              key={event.id}
              className={`p-3 rounded-lg border ${getEventColor(event.type)} transition-all hover:shadow-sm`}
            >
              <div className="flex items-start gap-3">
                {/* Date Box */}
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg border border-current/20 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold leading-none">
                    {new Date(event.date).getDate()}
                  </span>
                  <span className="text-[10px] uppercase">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.type)}
                    <p className="text-sm font-medium truncate">{event.title}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs opacity-80">
                    {event.provider && <span>{event.provider}</span>}
                    {event.isVirtual && (
                      <span className="flex items-center gap-1">
                        <Video size={10} /> Virtual
                      </span>
                    )}
                    {!event.isVirtual && (
                      <span className="flex items-center gap-1">
                        <MapPin size={10} /> In-person
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {urgent && (
                      <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">
                        {relative}
                      </span>
                    )}
                    {relative && !urgent && (
                      <span className="text-[10px] text-current/60">
                        in {relative}
                      </span>
                    )}
                    {event.url && (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink size={10} /> Details
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventsCalendar;
