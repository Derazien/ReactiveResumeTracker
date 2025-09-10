import { t } from "@lingui/macro";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@reactive-resume/ui";
import { Mail, UserPlus, Users } from "lucide-react";

export const ContactsSection = () => {
  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t`Contacts`}</h3>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-2 size-4" />
          {t`Add Contact`}
        </Button>
      </div>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="size-4" />
            {t`Company Contacts`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground py-8 text-center">
            <Users className="mx-auto mb-2 size-8 opacity-50" />
            <p className="text-sm">{t`No contacts found`}</p>
            <p className="mt-1 text-xs">{t`Add contacts to generate personalized messages`}</p>
          </div>
        </CardContent>
      </Card>

      {/* Message Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Mail className="size-4" />
            {t`Message Generation`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm">
              <p className="text-muted-foreground mb-2">{t`Generate personalized messages for:`}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t`Email Messages`}</span>
                  <Badge variant="secondary" className="text-xs">
                    {t`Coming Soon`}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t`LinkedIn Messages`}</span>
                  <Badge variant="secondary" className="text-xs">
                    {t`Coming Soon`}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t`Follow-up Messages`}</span>
                  <Badge variant="secondary" className="text-xs">
                    {t`Coming Soon`}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t`Networking Tips`}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• {t`Research contacts before reaching out`}</li>
            <li>• {t`Personalize your messages with specific details`}</li>
            <li>• {t`Keep messages concise and professional`}</li>
            <li>• {t`Follow up appropriately after initial contact`}</li>
            <li>• {t`Use LinkedIn to find relevant contacts`}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
