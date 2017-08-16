$(document).ready(function() { 
    function displayVals() {
        var cnt_scr = 0;
        var cnt_pltfm_tc = 0;
        var cnt_pj_tc = 0;
        var cnt_scrs_no_ptfm_tc = 0;
        var cnt_pltfm_tc_no_pj_tc = 0;
        var cnt_pj_tc_not_completed = 0;
        var cnt_scr_covered = 0;
        var cnt_scr_covered_ign_tc_states = 0;

        var selected_project = $( "#selected_project" ).val();
        //var selected_project = '/378 DAIMLER BR463 FT46 2SP'//'/389 FIAT GIORGIO ATC'
        
        var $field_cnt_scr = $('.cnt_scr');
        var $field_cnt_ptfm_tc = $('.cnt_pltfm_tc');
        var $field_cnt_pj_tc = $('.cnt_pj_tc');
        
        var $field_cnt_scrs_no_ptfm_tc = $('.cnt_scrs_no_ptfm_tc');
        var $field_cnt_pltfm_tc_no_pj_tc = $('.cnt_pltfm_tc_no_pj_tc');
        var $field_cnt_pj_tc_not_completed = $('.cnt_pj_tc_not_completed');
        
        var $field_scr_coverage = $('.scr_coverage');
        var $field_scr_coverage_ign_tc_states = $('.scr_coverage_ign_tc_states');
        
        var is_scr_active = false;
        var is_pltfm_tc_active = false;
        var is_pj_tc_active = false;
        
        var pltfm_tc_id  = -1;
        var pltfm_tc_name = '';
        var pltfm_tc_state = '';
        
        var pj_tc_id  = -1;
        var pj_tc_name = '';
        var pj_tc_state = '';
        var pj_tc_project = '';
        
        var sum_pj_tc_state = '';
        
        var prev_scr_header = null;
        var prev_scr = null;
        var pltfm_tc = null;
        var scr_relationship = null;
        
        var hide_active = true;
        
        function handle_scr_header() {
            if ((is_scr_active == true) && (is_pltfm_tc_active == false))
            {
               cnt_scrs_no_ptfm_tc++; 
            }
            else if ((is_scr_active == true) && (is_pltfm_tc_active == true) && (is_pj_tc_active == false))
            {
                cnt_pltfm_tc_no_pj_tc++;
            }
            else if (is_scr_active == true)
            {
                if (sum_pj_tc_state == 'completed')
                {
                    cnt_scr_covered++;
                    cnt_scr_covered_ign_tc_states++;
                    prev_scr_header.hide();
                    prev_scr.hide();
                    scr_relationship.hide();                            
                }
                else
                {
                    if (selected_project == '/Product Platform')
                    {
                        prev_scr_header.hide();
                        prev_scr.hide();
                        scr_relationship.hide();  
                    }
                    cnt_scr_covered_ign_tc_states++;
                }
            }        
        }
        
        $('tbody tr').each(function(){
            switch($(this).attr('class'))
            {
                case 'scr_header':
                    $(this).show();

                    handle_scr_header();

                    prev_scr_header = $(this)

                    break;
                case 'scr':
                    $(this).show()
                    cnt_scr++;
                   
                    prev_scr = $(this)
                    is_scr_active = true;
                    is_pltfm_tc_active = false;
                    is_pj_tc_active = false;
                    sum_pj_tc_state = 'completed'
                    break;
                case 'scr_relationship':
                    $(this).show();
                    scr_relationship = $(this);
                    break;
                case 'platform_test_case':
                    $(this).show()
                    cnt_pltfm_tc++;
                    pltfm_tc = $(this)
                    is_pltfm_tc_active = true;
                    is_pj_tc_active = false;
                    pltfm_tc_id    = this.getElementsByClassName('ID')[0].childNodes[0].nodeValue;
                    pltfm_tc_name  = this.getElementsByClassName('Subject')[0].childNodes[0].nodeValue;
                    pltfm_tc_state = this.getElementsByClassName('State')[0].childNodes[0].nodeValue;

                    if (selected_project == '/Product Platform')
                    {
                        if ((sum_pj_tc_state == 'completed') && 
                            ((pltfm_tc_state == 'TC Completed') || (pltfm_tc_state == 'TC Failed')))
                        {
                            sum_pj_tc_state = 'completed';                    
                        }
                        else
                        {
                            sum_pj_tc_state = 'not completed'; // Testing not finished yet
                        }
                        
                        $(this).hide();
                        pltfm_tc.hide();   
                        
                        is_pj_tc_active = true;
                        $(this).hide();
                    }
                    
                    //pltfm_tc_name = $(this)('td.Subject').value;
                    //for (var i = 0; i < $(this).length; i++)
                    //{
                    //    cnt_pltfm_tc++;
                    //}
                    break;
                case 'project_test_case':
                    $(this).show()
                    pj_tc_project = this.getElementsByClassName('Project')[0].childNodes[0].nodeValue;
                    
                    if (selected_project == 'Project')
                    {
                        pj_tc_id      = this.getElementsByClassName('ID')[0].childNodes[0].nodeValue;
                        pj_tc_name    = this.getElementsByClassName('Subject')[0].childNodes[0].nodeValue;
                        pj_tc_state   = this.getElementsByClassName('State')[0].childNodes[0].nodeValue;
                        
                        if (pj_tc_state != 'TC Closed')
                        {
                            if ((sum_pj_tc_state == 'completed') && 
                               ((pj_tc_state == 'TC Completed') || (pj_tc_state == 'TC Failed')))
                            {
                                sum_pj_tc_state = 'completed';
                                $(this).hide();
                                pltfm_tc.hide();                            
                            }
                            else
                            {
                                sum_pj_tc_state = 'not completed'; // Testing not finished yet
                            }
                            
                            is_pj_tc_active = true;
                            cnt_pj_tc++
                        }
                        else
                        {
                            $(this).hide();
                        }
                    }
                    else if (selected_project != 'None')
                    {
                        $(this).hide();
                    }
                    break;
                default:
                    break;
            }

        });

        // last scr is not handled yet ... 
        handle_scr_header();
        
        $field_cnt_scr.html(cnt_scr);
        $field_cnt_ptfm_tc.html(cnt_pltfm_tc);
        $field_cnt_pj_tc.html(cnt_pj_tc);
        
        $field_cnt_scrs_no_ptfm_tc.html(cnt_scrs_no_ptfm_tc);
        $field_cnt_pltfm_tc_no_pj_tc.html(cnt_pltfm_tc_no_pj_tc);
        $field_cnt_pj_tc_not_completed.html(cnt_pj_tc_not_completed);
        
        $field_scr_coverage.html(cnt_scr_covered + ' / ' + (cnt_scr) + '  => ' + Math.round(cnt_scr_covered/cnt_scr * 100) + '&percnt; Coverage)');
        $field_scr_coverage_ign_tc_states.html(cnt_scr_covered_ign_tc_states + ' / ' + (cnt_scr) + '  => ' + Math.round(cnt_scr_covered_ign_tc_states/cnt_scr * 100) + '&percnt; Coverage)');
        
        var cnt_scrs_with_ptfm_tc = cnt_scr-cnt_scrs_no_ptfm_tc;

        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawPieChart1);
    
        function drawPieChart1() {
//            alert(cnt_scr);
//            alert(cnt_pltfm_tc);
//            alert(cnt_pj_tc);

            var data = google.visualization.arrayToDataTable([
                ['Method', 'Qty'],
                ['SCRs w/  PF TC', cnt_scrs_with_ptfm_tc],
                ['SCRs w/o PF TC', cnt_scrs_no_ptfm_tc]
            ]);
            
            var options = {
                title: 'SCRs with PF Testcases'
            };
        
            var chart = new google.visualization.PieChart(document.getElementById('PieChart1'));
            chart.draw(data, options);

    }


        var not_completed = cnt_scr - cnt_scr_covered;
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawPieChart2);

        function drawPieChart2() {
            var data = google.visualization.arrayToDataTable([
                ['Method', 'Qty'],
                ['SCRs with  TC completed', cnt_scr_covered],
                ['SCRs with TC failed', not_completed]
            ]);
            
            var options = {
                title: 'Coverage of Test Cases'
            };
        
            var chart = new google.visualization.PieChart(document.getElementById('PieChart2'));
            chart.draw(data, options);

    }

        var TC_not_covered = cnt_scr - cnt_scr_covered_ign_tc_states;
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawPieChart3);

        function drawPieChart3() {
            var data = google.visualization.arrayToDataTable([
                ['Method', 'Qty'],
                ['SCRs with PF TC completed', cnt_scr_covered_ign_tc_states],
                ['SCRs with PF TC failed', TC_not_covered]
            ]);
            
            var options = {
                title: 'Test Case States'
            };
        
            var chart = new google.visualization.PieChart(document.getElementById('PieChart3'));
            chart.draw(data, options);

    }



    }
    
    $( "select" ).change( displayVals );
    displayVals();
    
});