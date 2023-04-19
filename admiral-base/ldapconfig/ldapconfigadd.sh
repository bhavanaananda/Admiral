#!/bin/bash
#
# Apply modifications to LDAP from ldif file
#

if [ -z $1 ]; then
    echo "Usage: $0 <ldif-file>"
    exit
fi

ldapadd -x -D cn=admin,%{ADMIRALFULLDN} -W -f $1
#cn=admin,cn=config 

# End.
