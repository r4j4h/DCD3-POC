<?php
/**
 * Created by PhpStorm.
 * User: brianbuikema
 * Date: 9/16/14
 * Time: 1:07 PM
 */

//$json = '{"a":1,"b":2,"c":3,"d":4,"e":5}';
$string = file_get_contents("./data/sample-referral-by-source-count.json");
$json = json_decode($string, true);

//foreach ($json['data'] as $key => $value)
//{
//    echo "Name: $value Status: $value]<br />";
//}
//var_dump($json);

foreach ($json as $key => $value) {
    if (!is_array($value)) {
        echo $key . '=>' . $value . '<br/>';
    } else {
        foreach ($value as $key => $value2) {
            if (!is_array($value2)) {
                echo $key . '=>' . $value2 . '<br/>';
            } else {
                foreach ($value2 as $key => $value3) {
                    echo $key . '=>' . $value3 . '<br/>';
                }
            }
        }
    }
}?>

<script type="text/javascript">

//    var json = '{"result":true,"count":1}',
        obj = JSON.parse(json);

    alert(obj.Result.length);

function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                alert(allText);
            }
        }
    }
    rawFile.send(null);
}
</script>
