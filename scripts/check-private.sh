#!/usr/bin/env bash
# Fails when a file that git would publish holds something that identifies a home:
# tokens, LAN addresses, email addresses, device MACs, coordinates.
# Add your own names, street or hostname to .private-words (one per line, ignored by git).
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

patterns=(
  "access token|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}"
  "LAN address|(^|[^0-9.])(192\.168|10\.[0-9]{1,3}|172\.(1[6-9]|2[0-9]|3[01]))\.[0-9]{1,3}\.[0-9]{1,3}"
  "email address|[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z0-9.-]*[A-Za-z]{2,}"
  "Google calendar id|[A-Za-z0-9.]+_(gmail|googlemail)_com"
  "device MAC|_[0-9a-f]{12}([^0-9a-f]|$)|([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}"
  "coordinates in an entity id|_[0-9]{1,3}_[0-9]{3,}_[0-9]{1,3}_[0-9]{3,}"
  "coordinates|-?[0-9]{1,2}\.[0-9]{4,}, ?-?[0-9]{1,3}\.[0-9]{4,}"
)
email_allowed='^noreply@|@example\.(com|org)$'

files=()
while IFS= read -r -d '' f; do
  [[ -f "$f" ]] && files+=("$f")
done < <(git ls-files -z --cached --others --exclude-standard)

found=0
# Prints only file:line, so a hit is not copied into a public CI log.
report() {
  echo "$1:"
  cut -d: -f1,2 | sort -u | sed 's/^/  /'
  found=1
}

for entry in "${patterns[@]}"; do
  label="${entry%%|*}"
  regex="${entry#*|}"
  hits=$(grep -I -n -o -E -e "$regex" -- "${files[@]}" || true)
  if [[ "$label" == "email address" ]]; then
    hits=$(while IFS= read -r hit; do
      [[ -z "$hit" || "${hit#*:*:}" =~ $email_allowed ]] || echo "$hit"
    done <<<"$hits")
  fi
  [[ -n "$hits" ]] && report "$label" <<<"$hits"
done

if [[ -s .private-words ]]; then
  hits=$(grep -I -n -i -w -F -f <(grep -v -e '^#' -e '^[[:space:]]*$' .private-words) -- "${files[@]}" || true)
  [[ -n "$hits" ]] && report "word from .private-words" <<<"$hits"
fi

if (( found )); then
  echo
  echo "Private data found. Move it to config.js (ignored by git) or replace it with a placeholder."
  exit 1
fi
echo "No private data found in ${#files[@]} files."
