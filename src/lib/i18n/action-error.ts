import { AppError, toErrorMessage } from "@/lib/errors";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

const KNOWN_ERRORS: Record<string, string> = {
  "A name stays between 1 and 80 characters.": "error.name",
  "A portrait needs a quiet HTTPS link.": "error.portrait",
  "Choose a JPEG, PNG, or WebP still.": "error.portraitKind",
  "This portrait is too large to keep.": "error.portraitSize",
  "This portrait could not be kept just now.": "error.portraitKeep",
  "A bio stays under 280 characters.": "error.bio",
  "Choose light, dark, or auto.": "error.theme",
  "Keep at least one format on your shelf.": "error.oneFormat",
  "Your space could not be saved.": "error.spaceSave",
  "That Discogs name does not look right.": "error.discogsName",
  "That shelf looks empty.": "error.emptyShelf",
  "Nothing on that shelf matched the formats you keep.": "error.formatsMismatch",
  "Choose a Resonance copy to bring home.": "error.chooseCopy",
  "This copy is too large to bring home at once.": "error.copyTooLarge",
  "This does not sound like a Resonance copy.": "error.notResonance",
  "This copy has no format left to listen to.": "error.noFormatLeft",
  "Choose vinyl, cassette, or CD.": "error.chooseFormat",
  "Choose a shelf layout.": "error.layout",
  "That date could not be kept.": "error.date",
  "This memory could not be saved.": "error.memory",
  "This pressing is already on your shelf.": "error.alreadyOnShelf",
  "This record is not in your collection.": "error.notInCollection",
  "Your collection could not be loaded.": "error.collectionLoad",
  "The record could not be added to your collection.": "error.recordAdd",
  "This record could not be opened.": "error.recordOpen",
  "This record could not be updated.": "error.recordUpdate",
  "This record could not be removed.": "error.recordRemove",
  "Those records could not be added to your collection.": "error.recordsAdd",
  "This copy could not be brought home.": "error.copyHome",
  "Your settings could not be loaded.": "error.settingsLoad",
  "Your settings could not be saved.": "error.settingsSave",
  "A record needs both an artist and a title.": "error.artistTitle",
  "Discogs could not be reached.": "error.discogsReach",
  "Discogs asked us to slow down. Try again in a moment.": "error.discogsSlow",
  "That release is no longer on Discogs.": "error.discogsGone",
  "Discogs returned an unreadable response.": "error.discogsUnread",
  "That Discogs release could not be found.": "error.discogsMissing",
  "That Discogs shelf could not be found, or it is private.": "error.discogsPrivate",
  "Discogs is unavailable right now.": "error.discogsDown",
  "Sign in to continue.": "error.signIn",
  "This item could not be found.": "error.notFound",
  "The collection could not be saved.": "error.database",
  "Something went wrong. Please try again.": "error.generic",
  "This journal could not be opened.": "auth.couldNotOpen",
  "Those credentials did not match.": "auth.credentials",
  "This letter could not be sent just now.": "auth.resetCouldNotSend",
  "Clipboard is unavailable.": "error.clipboard",
  "This release could not be added.": "error.releaseAdd",
  "This pressing could not be kept waiting.": "error.keepWaiting",
  "This record could not be moved to your shelf.": "error.moveShelf",
  "This record could not be kept close.": "error.keepCloseFail",
  "This record could not be released.": "error.releaseItem",
};

export function localizedError(locale: Locale, error: unknown): string {
  const message = error instanceof AppError ? error.message : toErrorMessage(error);
  const key = KNOWN_ERRORS[message];
  return key ? t(locale, key) : t(locale, "error.generic");
}
