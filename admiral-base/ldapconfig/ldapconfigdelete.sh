#!/bin/bash
#
# Apply modifications to LDAP from ldif file
#

if [ -z $1 ]; then
    echo "Usage: $0 <distinguished-name>"
    exit
fi

ldapdelete -x -D cn=admin,%{ADMIRALFULLDN} -W $1

# End.
