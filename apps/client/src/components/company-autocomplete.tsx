import { t } from "@lingui/macro";
import { Check, Plus, MagnifyingGlass } from "@phosphor-icons/react";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { useState } from "react";

import { useSearchCompanies, type Company } from "@/client/services/company";

interface CompanyAutocompleteProps {
  value?: string;
  onSelect: (company: Company | null) => void;
  onCreateNew?: (companyName: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const CompanyAutocomplete = ({
  value,
  onSelect,
  onCreateNew,
  placeholder = t`Search companies...`,
  disabled = false,
}: CompanyAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: companies = [], isLoading } = useSearchCompanies(searchQuery);

  const selectedCompany = companies.find(company => company.name === value);

  const handleSelect = (company: Company) => {
    onSelect(company);
    setOpen(false);
    setSearchQuery("");
  };

  const handleCreateNew = () => {
    if (searchQuery.trim() && onCreateNew) {
      onCreateNew(searchQuery.trim());
      setOpen(false);
      setSearchQuery("");
    }
  };

  const displayValue = selectedCompany?.name || value || "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <MagnifyingGlass className="h-4 w-4 opacity-50" />
            <span className={cn("truncate", !displayValue && "text-muted-foreground")}>
              {displayValue || placeholder}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={t`Search companies...`}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {searchQuery.length < 3 ? (
                <div className="text-center py-6 text-muted-foreground">
                  {t`Type at least 3 characters to search`}
                </div>
              ) : isLoading ? (
                <div className="text-center py-6 text-muted-foreground">
                  {t`Searching...`}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-muted-foreground mb-2">
                    {t`No companies found matching "${searchQuery}"`}
                  </div>
                  {onCreateNew && searchQuery.trim() && (
                    <Button
                      size="sm"
                      onClick={handleCreateNew}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {t`Create "${searchQuery}"`}
                    </Button>
                  )}
                </div>
              )}
            </CommandEmpty>
            {companies.length > 0 && (
              <CommandGroup>
                {companies.map((company) => (
                  <CommandItem
                    key={company.id}
                    value={company.name}
                    onSelect={() => handleSelect(company)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{company.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {company.industry && (
                          <span>{company.industry}</span>
                        )}
                        {company.industry && company.location && " • "}
                        {company.location && (
                          <span>{company.location}</span>
                        )}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === company.name ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {searchQuery.length >= 3 && companies.length > 0 && onCreateNew && (
              <>
                <CommandGroup>
                  <CommandItem onSelect={handleCreateNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t`Create "${searchQuery}" as new company`}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
